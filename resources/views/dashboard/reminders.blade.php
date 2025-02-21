@extends('layouts.app')

@section('title', 'Solleciti')

@section('content')
    <div class="container-xxl flex-grow-1 container-p-y">
        <!-- Stats Cards -->
        <div class="row g-4 mb-4">
            <div class="col-sm-6 col-xl-3">
                <div class="card">
                    <div class="card-body">
                        <div class="d-flex align-items-start justify-content-between">
                            <div class="content-left">
                                <span class="fw-semibold d-block mb-1">Totale Solleciti</span>
                                <h3 class="card-title mb-0">{{ number_format($stats['total_reminders']) }}</h3>
                            </div>
                            <div class="avatar">
                                <span class="avatar-initial rounded bg-label-primary">
                                    <i class="ti ti-mail ti-sm"></i>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-sm-6 col-xl-3">
                <div class="card">
                    <div class="card-body">
                        <div class="d-flex align-items-start justify-content-between">
                            <div class="content-left">
                                <span class="fw-semibold d-block mb-1">Solleciti Questo Mese</span>
                                <h3 class="card-title mb-0">{{ number_format($stats['reminders_this_month']) }}</h3>
                            </div>
                            <div class="avatar">
                                <span class="avatar-initial rounded bg-label-success">
                                    <i class="ti ti-calendar ti-sm"></i>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-sm-6 col-xl-3">
                <div class="card">
                    <div class="card-body">
                        <div class="d-flex align-items-start justify-content-between">
                            <div class="content-left">
                                <span class="fw-semibold d-block mb-1">Fatture Sollecitate</span>
                                <h3 class="card-title mb-0">{{ number_format($stats['total_invoices_reminded']) }}</h3>
                            </div>
                            <div class="avatar">
                                <span class="avatar-initial rounded bg-label-warning">
                                    <i class="ti ti-file ti-sm"></i>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-sm-6 col-xl-3">
                <div class="card">
                    <div class="card-body">
                        <div class="d-flex align-items-start justify-content-between">
                            <div class="content-left">
                                <span class="fw-semibold d-block mb-1">Importo Totale</span>
                                <h3 class="card-title mb-0">€
                                    {{ number_format($stats['total_amount_reminded'], 2, ',', '.') }}</h3>
                            </div>
                            <div class="avatar">
                                <span class="avatar-initial rounded bg-label-info">
                                    <i class="ti ti-currency-euro ti-sm"></i>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Chart -->
        <div class="card mb-4">
            <div class="card-header">
                <h5 class="card-title mb-0">Trend Mensile</h5>
            </div>
            <div class="card-body">
                <canvas id="monthlyTrendChart" height="300"></canvas>
            </div>
        </div>

        <div class="row">
            <!-- Recent Reminders -->
            <div class="col-12 col-xl-8 mb-4">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="card-title mb-0">Ultimi Solleciti Inviati</h5>
                        <a href="{{ route('dashboard.reminders.details') }}" class="btn btn-primary btn-sm">
                            <i class="ti ti-list ti-xs me-1"></i>
                            Vedi tutti
                        </a>
                    </div>
                    <div class="table-responsive text-nowrap">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Cliente</th>
                                    <th class="text-center">Data</th>
                                    <th class="text-center">N° Fatture</th>
                                </tr>
                            </thead>
                            <tbody class="table-border-bottom-0">
                                @foreach ($recentReminders as $reminder)
                                    <tr>
                                        <td>{{ $reminder['client_name'] }}</td>
                                        <td class="text-center">
                                            {{ date('d/m/Y', DateTime::createFromFormat('d/m/Y H:i', $reminder['sent_date'])->getTimestamp()) }}
                                        </td>
                                        <td class="text-center">{{ $reminder['invoices_count'] }}</td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Top Clients -->
            <div class="col-12 col-xl-4 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="card-title mb-0">Top Clienti per Solleciti</h5>
                    </div>
                    <div class="card-body">
                        @foreach ($topClients as $client)
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <div class="d-flex align-items-center">
                                    <div class="avatar avatar-sm me-2">
                                        <span class="avatar-initial rounded bg-label-primary">
                                            {{ substr($client->client->name, 0, 2) }}
                                        </span>
                                    </div>
                                    <div>{{ $client->client->name }}</div>
                                </div>
                                <span class="badge bg-primary">{{ $client->reminder_count }} solleciti</span>
                            </div>
                        @endforeach
                    </div>
                </div>
            </div>
        </div>
    </div>

    @push('scripts')
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                const ctx = document.getElementById('monthlyTrendChart').getContext('2d');

                const monthlyData = @json($monthlyTrend);

                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: monthlyData.map(item => item.month),
                        datasets: [{
                            label: 'Numero di Solleciti',
                            data: monthlyData.map(item => item.total_reminders),
                            borderColor: config.colors.primary,
                            backgroundColor: config.colors.primary,
                            tension: 0.4,
                            pointStyle: 'circle',
                            pointRadius: 4,
                            pointHoverRadius: 6
                        }, {
                            label: 'Clienti Unici',
                            data: monthlyData.map(item => item.unique_clients),
                            borderColor: config.colors.info,
                            backgroundColor: config.colors.info,
                            tension: 0.4,
                            pointStyle: 'circle',
                            pointRadius: 4,
                            pointHoverRadius: 6
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            tooltip: {
                                mode: 'index',
                                intersect: false,
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                grid: {
                                    borderColor: config.colors.borderColor,
                                    drawBorder: true,
                                    borderDash: [8, 4],
                                    color: config.colors.borderColor
                                }
                            },
                            x: {
                                grid: {
                                    display: false
                                }
                            }
                        }
                    }
                });
            });
        </script>
    @endpush
@endsection
