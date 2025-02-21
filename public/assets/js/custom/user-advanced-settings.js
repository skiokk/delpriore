// public/assets/js/custom/user-advanced-settings.js

const embyPolicyDefinition = {
    basicPermissions: {
        title: "Basic Permissions",
        fields: {
            IsAdministrator: { type: "checkbox", label: "Administrator" },
            IsHidden: { type: "checkbox", label: "Hidden" },
            IsHiddenRemotely: { type: "checkbox", label: "Hidden Remotely" },
            IsHiddenFromUnusedDevices: { type: "checkbox", label: "Hidden From Unused Devices" },
            IsDisabled: { type: "checkbox", label: "Disabled" },
            IsTagBlockingModeInclusive: { type: "checkbox", label: "Tag Blocking Mode Inclusive" },
            AllowTagOrRating: { type: "checkbox", label: "Allow Tag/Rating" },
            EnableUserPreferenceAccess: { type: "checkbox", label: "User Preference Access" },
            EnableRemoteAccess: { type: "checkbox", label: "Remote Access" },
            EnableLiveTvManagement: { type: "checkbox", label: "Live TV Management" },
            EnableLiveTvAccess: { type: "checkbox", label: "Live TV Access" }
        }
    },
    mediaFeatures: {
        title: "Media Features",
        fields: {
            EnableMediaPlayback: { type: "checkbox", label: "Media Playback" },
            EnableAudioPlaybackTranscoding: { type: "checkbox", label: "Audio Transcoding" },
            EnableVideoPlaybackTranscoding: { type: "checkbox", label: "Video Transcoding" },
            EnablePlaybackRemuxing: { type: "checkbox", label: "Playback Remuxing" },
            EnableSyncTranscoding: { type: "checkbox", label: "Sync Transcoding" },
            EnableMediaConversion: { type: "checkbox", label: "Media Conversion" },
            EnableSubtitleDownloading: { type: "checkbox", label: "Subtitle Download" },
            EnableSubtitleManagement: { type: "checkbox", label: "Subtitle Management" }
        }
    },
    controlAccess: {
        title: "Control & Access",
        fields: {
            EnableRemoteControlOfOtherUsers: { type: "checkbox", label: "Remote Control Other Users" },
            EnableSharedDeviceControl: { type: "checkbox", label: "Shared Device Control" },
            EnablePublicSharing: { type: "checkbox", label: "Public Sharing" },
            EnableAllDevices: { type: "checkbox", label: "All Devices" },
            EnableAllChannels: { type: "checkbox", label: "All Channels" },
            EnableAllFolders: { type: "checkbox", label: "All Folders" },
            AllowCameraUpload: { type: "checkbox", label: "Camera Upload" },
            AllowSharingPersonalItems: { type: "checkbox", label: "Share Personal Items" }
        }
    },
    contentManagement: {
        title: "Content Management",
        fields: {
            EnableContentDeletion: { type: "checkbox", label: "Content Deletion" },
            EnableContentDownloading: { type: "checkbox", label: "Content Download" }
        }
    },
    limits: {
        title: "Limits & Security",
        fields: {
            SimultaneousStreamLimit: { type: "number", label: "Simultaneous Stream Limit", min: 0, default: 2 },
            RemoteClientBitrateLimit: { type: "number", label: "Remote Client Bitrate Limit", min: 0, default: 0 },
            InvalidLoginAttemptCount: { type: "number", label: "Invalid Login Attempts", min: 0, default: 0 },
            LockedOutDate: { type: "number", label: "Lockout Date", default: 0 }
        }
    }
};

const jellyfinPolicyDefinition = {
    basicPermissions: {
        title: "Basic Permissions",
        fields: {
            IsAdministrator: { type: "checkbox", label: "Administrator" },
            IsHidden: { type: "checkbox", label: "Hidden" },
            IsDisabled: { type: "checkbox", label: "Disabled" },
            EnableCollectionManagement: { type: "checkbox", label: "Collection Management" },
            EnableUserPreferenceAccess: { type: "checkbox", label: "User Preference Access" },
            EnableLyricManagement: { type: "checkbox", label: "Lyric Management" }
        }
    },
    mediaFeatures: {
        title: "Media Features",
        fields: {
            EnableMediaPlayback: { type: "checkbox", label: "Media Playback" },
            EnableAudioPlaybackTranscoding: { type: "checkbox", label: "Audio Transcoding" },
            EnableVideoPlaybackTranscoding: { type: "checkbox", label: "Video Transcoding" },
            EnablePlaybackRemuxing: { type: "checkbox", label: "Playback Remuxing" },
            ForceRemoteSourceTranscoding: { type: "checkbox", label: "Force Remote Source Transcoding" },
            EnableSyncTranscoding: { type: "checkbox", label: "Sync Transcoding" },
            EnableMediaConversion: { type: "checkbox", label: "Media Conversion" },
            EnableSubtitleManagement: { type: "checkbox", label: "Subtitle Management" }
        }
    },
    controlAccess: {
        title: "Control & Access",
        fields: {
            EnableRemoteControlOfOtherUsers: { type: "checkbox", label: "Remote Control Other Users" },
            EnableSharedDeviceControl: { type: "checkbox", label: "Shared Device Control" },
            EnableRemoteAccess: { type: "checkbox", label: "Remote Access" },
            EnablePublicSharing: { type: "checkbox", label: "Public Sharing" },
            EnableAllDevices: { type: "checkbox", label: "All Devices" },
            EnableAllFolders: { type: "checkbox", label: "All Folders" },
            EnableAllChannels: { type: "checkbox", label: "All Channels" }
        }
    },
    contentManagement: {
        title: "Content Management",
        fields: {
            EnableContentDeletion: { type: "checkbox", label: "Content Deletion" },
            EnableContentDownloading: { type: "checkbox", label: "Content Download" },
            EnableLiveTvManagement: { type: "checkbox", label: "Live TV Management" },
            EnableLiveTvAccess: { type: "checkbox", label: "Live TV Access" }
        }
    },
    limits: {
        title: "Limits & Security",
        fields: {
            RemoteClientBitrateLimit: { type: "number", label: "Remote Client Bitrate Limit", min: 0, default: 0 },
            LoginAttemptsBeforeLockout: { type: "number", label: "Login Attempts Before Lockout", min: -1, default: -1 },
            MaxActiveSessions: { type: "number", label: "Max Active Sessions", min: 0, default: 0 },
            InvalidLoginAttemptCount: { type: "number", label: "Invalid Login Attempts", min: 0, default: 0 }
        }
    }
};

const fixedFields = serverType === 'emby' ? {
    BlockedTags: [],
    RestrictedFeatures: [],
    ExcludedSubFolders: [],
    IncludeTags: [],
    EnableContentDeletionFromFolders: [],
    EnabledChannels: [],
    EnabledFolders: [],
    EnabledDevices: [],
    AuthenticationProviderId: "Emby.Server.Implementations.Library.DefaultAuthenticationProvider"
} : {
    BlockedTags: [],
    AllowedTags: [],
    BlockedMediaFolders: [],
    BlockedChannels: [],
    EnableContentDeletionFromFolders: [],
    EnabledChannels: [],
    EnabledFolders: [],
    EnabledDevices: [],
    AuthenticationProviderId: "Jellyfin.Server.Implementations.Users.DefaultAuthenticationProvider",
    PasswordResetProviderId: "Jellyfin.Server.Implementations.Users.DefaultPasswordResetProvider",
    SyncPlayAccess: "None"
};

document.addEventListener('DOMContentLoaded', function () {
    loadPolicyForm();
});

function loadPolicyForm() {
    const container = document.getElementById('policyFields');
    const definition = serverType === 'emby' ? embyPolicyDefinition : jellyfinPolicyDefinition;

    Object.entries(definition).forEach(([_, section]) => {
        container.appendChild(createSection(section));
    });
}

function createSection(section) {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'row mb-4';

    const titleDiv = document.createElement('div');
    titleDiv.className = 'col-12';
    titleDiv.innerHTML = `<h6 class="fw-bold">${section.title}</h6>`;

    const fieldsDiv = document.createElement('div');
    fieldsDiv.className = 'row g-3';

    Object.entries(section.fields).forEach(([key, field]) => {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'col-md-4';

        if (field.type === 'checkbox') {
            fieldDiv.innerHTML = `
                <div class="form-check">
                    <input type="checkbox" class="form-check-input" id="${key}"
                           ${policy[key] ? 'checked' : ''}>
                    <label class="form-check-label" for="${key}">${field.label}</label>
                </div>`;
        } else if (field.type === 'number') {
            fieldDiv.innerHTML = `
                <label for="${key}" class="form-label">${field.label}</label>
                <input type="number" class="form-control" id="${key}"
                       value="${policy[key] ?? field.default}"
                       min="${field.min}">`;
        }

        fieldsDiv.appendChild(fieldDiv);
    });

    sectionDiv.appendChild(titleDiv);
    sectionDiv.appendChild(fieldsDiv);
    return sectionDiv;
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `bs-toast toast fade show border-2 border-${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="toast-header">
            <i class="ti ti-${type === 'success' ? 'check' : 'x'} me-2 text-${type}"></i>
            <span class="me-auto fw-semibold">${type.charAt(0).toUpperCase() + type.slice(1)}</span>
            <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body">${message}</div>`;

    container.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

document.getElementById('policyForm').addEventListener('submit', function (e) {
    e.preventDefault();

    let policy = { ...fixedFields };

    // Raccoglie tutti i valori dai campi input
    document.querySelectorAll('input').forEach(input => {
        const name = input.id;
        if (input.type === 'checkbox') {
            policy[name] = input.checked;
        } else if (input.type === 'number') {
            policy[name] = parseInt(input.value) || 0;
        }
    });

    console.log('Sending policy:', policy); // Per debug

    fetch(this.action, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        },
        body: JSON.stringify({ policy })
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => Promise.reject(err));
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showToast('Policy updated successfully', 'success');
            } else {
                showToast(data.message || 'Error updating policy', 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast(error.message || 'Error updating policy', 'danger');
        });
});
