<?php

namespace App\Exports;

use App\Models\AuditLog;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AuditLogExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $logs;
    protected $format;

    public function __construct($logs, $format = 'xlsx')
    {
        $this->logs = $logs;
        $this->format = $format;
    }

    public function collection()
    {
        return $this->logs;
    }

    public function headings(): array
    {
        return [
            'ID',
            'User Name',
            'User Email',
            'Action',
            'Entity Type',
            'Entity ID',
            'Description',
            'IP Address',
            'User Agent',
            'URL',
            'Changes Summary',
            'Created At',
        ];
    }

    public function map($log): array
    {
        return [
            $log->id,
            $log->user ? $log->user->name : 'N/A',
            $log->user ? $log->user->email : 'N/A',
            $log->action,
            $log->entity_type,
            $log->entity_id ?? 'N/A',
            $log->description,
            $log->ip_address ?? 'N/A',
            $log->user_agent ?? 'N/A',
            $log->url ?? 'N/A',
            $log->changes_summary ?? 'N/A',
            $log->created_at->format('Y-m-d H:i:s'),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            // Style the first row as bold text
            1 => ['font' => ['bold' => true]],
            
            // Styling specific columns
            'A' => ['font' => ['bold' => true]],
            'D' => ['font' => ['bold' => true]], // Action column
            'E' => ['font' => ['bold' => true]], // Entity Type column
        ];
    }
}
