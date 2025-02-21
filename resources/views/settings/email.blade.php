@extends('layouts.app')

@section('title', 'Impostazioni Email')

@section('content')
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">Impostazioni Email Solleciti</h5>
                </div>
                <div class="card-body">
                    @if (session('success'))
                        <div class="alert alert-success">
                            {{ session('success') }}
                        </div>
                    @endif

                    <form action="{{ route('settings.email.update') }}" method="POST">
                        @csrf
                        @method('PUT')

                        <div class="mb-3">
                            <label class="form-label">Giorni di attesa prima del sollecito</label>
                            <input type="number" class="form-control @error('days_before_reminder') is-invalid @enderror"
                                name="days_before_reminder"
                                value="{{ old('days_before_reminder', $settings->days_before_reminder) }}" required>
                            @error('days_before_reminder')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                            <small class="form-text text-muted">
                                Numero di giorni dalla data della fattura dopo i quali inviare il sollecito.
                            </small>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Oggetto Email</label>
                            <input type="text" class="form-control @error('email_subject') is-invalid @enderror"
                                name="email_subject" value="{{ old('email_subject', $settings->email_subject) }}" required>
                            @error('email_subject')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Template Email</label>
                            <textarea class="form-control @error('email_template') is-invalid @enderror" name="email_template" rows="10"
                                required>{{ old('email_template', $settings->email_template) }}</textarea>
                            @error('email_template')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                            <div class="form-text mt-2">
                                <strong>Variabili disponibili:</strong>
                                <ul class="mb-0">
                                    <li><code>{cliente}</code> - Nome del cliente</li>
                                    <li><code>{fatture}</code> - Lista delle fatture scadute</li>
                                    <li><code>{totale}</code> - Importo totale da pagare</li>
                                </ul>
                            </div>
                        </div>

                        <div class="d-flex gap-2">
                            <button type="submit" class="btn btn-primary">Salva Impostazioni</button>
                            <button type="button" class="btn btn-info" id="btnTestEmail">
                                <i class="ti ti-mail"></i> Invia Email di Test
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
@endsection

@push('scripts')
    <script>
        document.getElementById('btnTestEmail').addEventListener('click', function() {
            if (confirm('Vuoi inviare una email di test con le impostazioni attuali?')) {
                fetch('{{ route('settings.email.test') }}', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': '{{ csrf_token() }}'
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.error) {
                            alert('Errore: ' + data.error);
                        } else {
                            alert('Email di test inviata con successo!');
                        }
                    })
                    .catch(error => {
                        alert('Errore durante l\'invio dell\'email di test');
                    });
            }
        });
    </script>
@endpush
