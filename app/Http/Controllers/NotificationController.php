<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Notifications\DatabaseNotification;
use App\Services\NotificationService;
use App\Traits\ApiResponse;

class NotificationController extends Controller
{
    use ApiResponse;

    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $limit = $request->get('limit', 20);
        $unreadOnly = $request->get('unread_only', false);

        $notifications = $this->notificationService->getNotifications($user, $limit, $unreadOnly);
        
        $formattedNotifications = $notifications->map(function ($notification) {
            $data = json_decode($notification->data, true);
            return [
                'id' => $notification->id,
                'type' => $notification->type,
                'title' => $data['title'] ?? 'Notification',
                'message' => $data['message'] ?? '',
                'action_url' => $data['action_url'] ?? null,
                'icon' => $data['icon'] ?? null,
                'priority' => $data['priority'] ?? 'normal',
                'is_read' => $notification->read_at !== null,
                'created_at' => $notification->created_at->toISOString(),
                'read_at' => $notification->read_at?->toISOString(),
            ];
        });

        return $this->success([
            'notifications' => $formattedNotifications,
        ]);
    }

    public function unread(Request $request): JsonResponse
    {
        $user = $request->user();
        $limit = $request->get('limit', 20);

        $notifications = $this->notificationService->getNotifications($user, $limit, true);
        $count = $this->notificationService->getUnreadCount($user);
        
        $formattedNotifications = $notifications->map(function ($notification) {
            $data = json_decode($notification->data, true);
            return [
                'id' => $notification->id,
                'type' => $notification->type,
                'title' => $data['title'] ?? 'Notification',
                'message' => $data['message'] ?? '',
                'action_url' => $data['action_url'] ?? null,
                'icon' => $data['icon'] ?? null,
                'priority' => $data['priority'] ?? 'normal',
                'created_at' => $notification->created_at->toISOString(),
            ];
        });

        return $this->success([
            'notifications' => $formattedNotifications,
            'count' => $count,
        ]);
    }

    public function count(Request $request): JsonResponse
    {
        $user = $request->user();
        $unreadCount = $this->notificationService->getUnreadCount($user);
        $totalCount = DatabaseNotification::where('notifiable_id', $user->id)->count();

        return $this->success([
            'total' => $totalCount,
            'unread' => $unreadCount,
        ]);
    }

    public function markAsRead(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        
        $notification = DatabaseNotification::where('id', $id)
            ->where('notifiable_id', $user->id)
            ->first();

        if (!$notification) {
            return $this->error('Notification not found', 404);
        }

        $notification->markAsRead();

        return $this->success(null, 'Notification marked as read');
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = $request->user();
        $this->notificationService->markAllAsRead($user);

        return $this->success(null, 'All notifications marked as read');
    }

    public function delete(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        
        $notification = DatabaseNotification::where('id', $id)
            ->where('notifiable_id', $user->id)
            ->first();

        if (!$notification) {
            return $this->error('Notification not found', 404);
        }

        $notification->delete();

        return $this->success(null, 'Notification deleted');
    }

    public function settings(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Get user's notification channel preferences
        $channels = \App\Models\NotificationChannel::where('user_id', $user->id)
            ->pluck('is_enabled', 'channel')
            ->toArray();

        $defaults = [
            'email' => true,
            'sms' => false,
            'push' => true,
            'database' => true,
        ];

        $settings = array_merge($defaults, $channels);

        return $this->success([
            'email_notifications' => $settings['email'] ?? true,
            'push_notifications' => $settings['push'] ?? true,
            'sms_notifications' => $settings['sms'] ?? false,
            'database_notifications' => $settings['database'] ?? true,
        ]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email_notifications' => 'boolean',
            'push_notifications' => 'boolean',
            'sms_notifications' => 'boolean',
            'database_notifications' => 'boolean',
        ]);

        $user = $request->user();

        foreach ($validated as $channel => $enabled) {
            $channelName = str_replace('_notifications', '', $channel);
            
            \App\Models\NotificationChannel::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'channel' => $channelName,
                ],
                [
                    'is_enabled' => $enabled,
                ]
            );
        }

        return $this->success($validated, 'Notification settings updated');
    }
}
