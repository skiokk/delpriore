@extends('layouts.app')

@section('title', 'Clienti')

@push('css')
    <link rel="stylesheet" href="https://cdn.datatables.net/1.11.5/css/dataTables.bootstrap5.min.css">
@endpush

@section('content')
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Lista Clienti</h5>
                    <a href="{{ route('clients.create') }}" class="btn btn-primary">
                        <i class="ti ti-plus"></i> Nuovo Cliente
                    </a>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table id="clients-table" class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Nome/Ragione Sociale</th>
                                    <th>Tipo</th>
                                    <th>Codice Fiscale</th>
                                    <th>Telefono</th>
                                    <th>Stato</th>
                                    <th>Azioni</th>
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
            $('#clients-table').DataTable({
                processing: true,
                serverSide: true,
                ajax: '{{ route('clients.data') }}',
                columns: [{
                        data: 'name',
                        name: 'name'
                    },
                    {
                        data: 'type',
                        name: 'type'
                    },
                    {
                        data: 'fiscal_code',
                        name: 'fiscal_code'
                    },
                    {
                        data: 'phone',
                        name: 'phone'
                    },
                    {
                        data: 'is_active',
                        name: 'is_active'
                    },
                    {
                        data: 'actions',
                        name: 'actions',
                        orderable: false,
                        searchable: false
                    }
                ],
                language: {
                    url: 'https://cdn.datatables.net/plug-ins/1.11.5/i18n/it-IT.json'
                }
            });
        });

        function deleteClient(id) {
            if (confirm('Sei sicuro di voler eliminare questo cliente?')) {
                $.ajax({
                    url: `/clients/${id}`,
                    type: 'DELETE',
                    data: {
                        _token: '{{ csrf_token() }}'
                    },
                    success: function() {
                        $('#clients-table').DataTable().ajax.reload();
                    }
                });
            }
        }
    </script>
@endpush
