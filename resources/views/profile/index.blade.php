@extends('layouts.app')

@section('title', 'Profile')

@section('content')
    <div class="row">
        <div class="col-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">Profile</h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="mb-3 col-md-6">
                            <label class="form-label">Username</label>
                            <input type="text" class="form-control" value="{{ Auth::user()->username }}" readonly>
                        </div>
                        <div class="mb-3 col-md-6">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-control" value="{{ Auth::user()->email }}" readonly>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
