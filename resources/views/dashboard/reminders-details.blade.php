@extends('layouts.app')

@section('title', 'Dettaglio Solleciti')

@section('content')
    <div class="container-xxl flex-grow-1 container-p-y">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Filtri</h5>
                <a href="{{ route('dashboard.reminders') }}" class="btn btn-secondary btn-sm">
                    <i class="ti ti-arrow-left ti-xs me-1"></i>
                    Torna alla Dashboard
                </a>
            </div>
            <div class="card-body">
                <form action="{{ route('dashboard.reminders.details') }}" method="GET">
                    <div class="row g-3">
                        <div class="col-12 col-md-3">
                            <label class="form-label">Data Inizio</label>
                            <input type="date" name="start_date" value="{{ request('start_date') }}"
                                class="form-control">
                        </div>
                        <div class="col-12 col-md-3">
                            <label class="form-label">Data Fine</label>
                            <input type="date" name="end_date" value="{{ request('end_date') }}" class="form-control">
                        </div>
                        <div class="col-12 col-md-4">
                            <label class="form-label">Cliente</label>
                            <select name="client_id" class="form-select">
                                <option value="">Tutti i clienti</option>
                                @foreach ($clients ?? [] as $client)
                                    <option value="{{ $client->id }}"
                                        {{ request('client_id') == $client->id ? 'selected' : '' }}>
                                        {{ $client->name }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-12 col-md-2 d-flex align-items-end">
                            <button type="submit" class="btn btn-primary w-100">
                                <i class="ti ti-filter ti-xs me-1"></i>
                                Filtra
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>

        <div class="card mt-4">
            <div class="table-responsive text-nowrap">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th class="text-center">Data Invio</th>
                            <th class="text-center">N° Fatture</th>
                            <th class="text-center">Contenuto Email</th>
                        </tr>
                    </thead>
                    <tbody class="table-border-bottom-0">
                        @foreach ($logs as $log)
                            <tr>
                                <td>{{ $log->client->name }}</td>
                                <td class="text-center">{{ Carbon\Carbon::parse($log->sent_date)->format('d/m/Y') }}</td>
                                <td class="text-center">{{ count(json_decode($log->invoices_included, true)) }}</td>
                                <td class="text-center">
                                    <button type="button" class="btn btn-sm btn-icon btn-primary"
                                        onclick="showEmailContent('{{ $log->id }}')" data-bs-toggle="modal"
                                        data-bs-target="#emailModal">
                                        <i class="ti ti-eye ti-xs"></i>
                                    </button>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            <div class="card-footer">
                {{ $logs->links() }}
            </div>
        </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="emailModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Contenuto Email</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <pre id="emailContent" class="p-3 bg-light rounded" style="white-space: pre-wrap; word-wrap: break-word;"></pre>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Chiudi</button>
                </div>
            </div>
        </div>
    </div>

    @push('scripts')
        <script>
            function showEmailContent(logId) {
                fetch(`/email-logs/${logId}/content`)
                    .then(response => response.json())
                    .then(data => {
                        document.getElementById('emailContent').textContent = data.content;
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('Errore nel caricamento del contenuto dell\'email');
                    });
            }
        </script>
    @endpush
@endsection
