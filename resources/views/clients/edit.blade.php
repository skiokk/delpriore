@extends('layouts.app')

@section('title', 'Modifica Cliente')

@section('content')
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="mb-0">Modifica Cliente</h5>
                </div>
                <div class="card-body">
                    <form action="{{ route('clients.update', $client->id) }}" method="POST">
                        @csrf
                        @method('PUT')
                        <div class="row">
                            <!-- Dati Anagrafici -->
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Nome/Ragione Sociale *</label>
                                <input type="text" class="form-control @error('name') is-invalid @enderror"
                                    name="name" value="{{ old('name', $client->name) }}" required>
                                @error('name')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>

                            <div class="col-md-6 mb-3">
                                <label class="form-label">Tipo Cliente *</label>
                                <select class="form-select @error('type') is-invalid @enderror" name="type" required>
                                    <option value="private" {{ old('type', $client->type) == 'private' ? 'selected' : '' }}>
                                        Privato</option>
                                    <option value="company" {{ old('type', $client->type) == 'company' ? 'selected' : '' }}>
                                        Azienda</option>
                                </select>
                                @error('type')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>

                            <div class="col-md-6 mb-3">
                                <label class="form-label">Codice Fiscale</label>
                                <input type="text" class="form-control @error('fiscal_code') is-invalid @enderror"
                                    name="fiscal_code" value="{{ old('fiscal_code', $client->fiscal_code) }}">
                                @error('fiscal_code')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>

                            <div class="col-md-6 mb-3">
                                <label class="form-label">Partita IVA</label>
                                <input type="text" class="form-control @error('vat_number') is-invalid @enderror"
                                    name="vat_number" value="{{ old('vat_number', $client->vat_number) }}">
                                @error('vat_number')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>

                            <!-- Contatti -->
                            <div class="col-md-12 mb-3">
                                <label class="form-label">Indirizzo</label>
                                <input type="text" class="form-control @error('address') is-invalid @enderror"
                                    name="address" value="{{ old('address', $client->address) }}">
                                @error('address')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>

                            <div class="col-md-4 mb-3">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-control @error('email') is-invalid @enderror"
                                    name="email" value="{{ old('email', $client->email) }}">
                                @error('email')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>

                            <div class="col-md-4 mb-3">
                                <label class="form-label">Telefono</label>
                                <input type="text" class="form-control @error('phone') is-invalid @enderror"
                                    name="phone" value="{{ old('phone', $client->phone) }}">
                                @error('phone')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>

                            <div class="col-md-4 mb-3">
                                <label class="form-label">Cellulare</label>
                                <input type="text" class="form-control @error('mobile') is-invalid @enderror"
                                    name="mobile" value="{{ old('mobile', $client->mobile) }}">
                                @error('mobile')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>

                            <!-- Documenti -->
                            <div class="col-md-4 mb-3">
                                <label class="form-label">Numero Patente</label>
                                <input type="text" class="form-control @error('license_number') is-invalid @enderror"
                                    name="license_number" value="{{ old('license_number', $client->license_number) }}">
                                @error('license_number')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>

                            <div class="col-md-4 mb-3">
                                <label class="form-label">Scadenza Patente</label>
                                <input type="date" class="form-control @error('license_expiry') is-invalid @enderror"
                                    name="license_expiry"
                                    value="{{ old('license_expiry', $client->license_expiry?->format('Y-m-d')) }}">
                                @error('license_expiry')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>

                            <div class="col-md-4 mb-3">
                                <label class="form-label">Tipo Patente</label>
                                <input type="text" class="form-control @error('license_type') is-invalid @enderror"
                                    name="license_type" value="{{ old('license_type', $client->license_type) }}">
                                @error('license_type')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>

                            <!-- Extra -->
                            <div class="col-12 mb-3">
                                <label class="form-label">Note</label>
                                <textarea class="form-control @error('notes') is-invalid @enderror" name="notes" rows="3">{{ old('notes', $client->notes) }}</textarea>
                                @error('notes')
                                    <div class="invalid-feedback">{{ $message }}</div>
                                @enderror
                            </div>

                            <div class="col-12 mb-3">
                                <div class="form-check">
                                    <input type="checkbox" class="form-check-input" name="is_active" value="1"
                                        {{ old('is_active', $client->is_active) ? 'checked' : '' }}>
                                    <label class="form-check-label">Cliente Attivo</label>
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-12">
                                <button type="submit" class="btn btn-primary">Aggiorna Cliente</button>
                                <a href="{{ route('clients.index') }}" class="btn btn-secondary">Annulla</a>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
@endsection
