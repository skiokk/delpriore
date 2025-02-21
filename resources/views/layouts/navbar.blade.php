<!-- resources/views/layouts/navbar.blade.php -->
<nav class="layout-navbar container-xxl navbar navbar-expand-xl navbar-detached align-items-center bg-navbar-theme"
    id="layout-navbar">
    <div class="d-flex align-items-center w-100">
        <div class="layout-menu-toggle navbar-nav align-items-center me-3 d-xl-none">
            <a class="nav-item nav-link px-0 me-4" href="javascript:void(0)">
                <i class="ti ti-menu-2 ti-sm"></i>
            </a>
        </div>
        <h4 class="fw-bold m-0 flex-grow-1">@yield('title', 'Dashboard')</h4>

        <div class="d-flex align-items-center">

            <span class="badge bg-primary text-white px-3 py-2">
                {{ Auth::user()->username }}
            </span>
        </div>
    </div>
</nav>
