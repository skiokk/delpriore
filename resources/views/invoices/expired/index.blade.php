@extends('layouts.app')

@section('title', 'Fatture Scadute')

@push('css')
    <link rel="stylesheet" href="https://cdn.datatables.net/1.11.5/css/dataTables.bootstrap5.min.css">
@endpush

@section('content')
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">Importa Fatture</h5>
                </div>
                <div class="card-body">
                    <form action="{{ route('expired-invoices.import') }}" method="POST" enctype="multipart/form-data">
                        @csrf
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">File Excel</label>
                                    <input type="file" class="form-control" name="file" accept=".xls,.xlsx" required>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">&nbsp;</label>
                                    <button type="submit" class="btn btn-primary d-block">Importa</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <div class="row mt-4">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">Lista Fatture Scadute</h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table id="invoices-table" class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Stato</th>
                                    <th>Numero Fattura</th>
                                    <th>Data Fattura</th>
                                    <th>Cliente</th>
                                    <th>Totale</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@push('scripts')
    <script src="https://cdn.datatables.net/1.11.5/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/1.11.5/js/dataTables.bootstrap5.min.js"></script>
    <script>
        $(document).ready(function() {
            $('#invoices-table').DataTable({
                processing: true,
                serverSide: true,
                ajax: '{{ route('expired-invoices.data') }}',
                order: [
                    [2, 'desc']
                ], // Ordina per data fattura decrescente
                columns: [{
                        data: 'status',
                        name: 'status',
                        orderable: false
                    },
                    {
                        data: 'invoice_number',
                        name: 'invoice_number'
                    },
                    {
                        data: 'invoice_date',
                        name: 'invoice_date'
                    },
                    {
                        data: 'client_name',
                        name: 'client_name'
                    },
                    {
                        data: 'total_amount',
                        name: 'total_amount'
                    }
                ],
                language: {
                    url: 'https://cdn.datatables.net/plug-ins/1.11.5/i18n/it-IT.json'
                }
            });
        });
    </script>
@endpush
