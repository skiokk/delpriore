document.addEventListener('DOMContentLoaded', function () {
    loadPolicyForm();
    document.getElementById('policyForm').addEventListener('submit', handleFormSubmit);
});

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

function getDefaultArrays(serverType) {
    const common = {
        BlockedTags: [],
        EnableContentDeletionFromFolders: [],
        EnabledChannels: [],
        EnabledFolders: [],
        EnabledDevices: [],
        AccessSchedules: [],
        BlockUnratedItems: []
    };

    if (serverType === 'emby') {
        return {
            ...common,
            RestrictedFeatures: [],
            ExcludedSubFolders: [],
            IncludeTags: []
        };
    }

    return {
        ...common,
        AllowedTags: [],
        BlockedMediaFolders: [],
        BlockedChannels: []
    };
}

function getDefaultFixed(serverType) {
    if (serverType === 'emby') {
        return {
            AuthenticationProviderId: "Emby.Server.Implementations.Library.DefaultAuthenticationProvider"
        };
    }
    return {
        AuthenticationProviderId: "Jellyfin.Server.Implementations.Users.DefaultAuthenticationProvider",
        PasswordResetProviderId: "Jellyfin.Server.Implementations.Users.DefaultPasswordResetProvider",
        SyncPlayAccess: "None"
    };
}

function loadPolicyForm() {
    const serverType = document.getElementById('server_type').selectedOptions[0].text.toLowerCase();
    const form = document.getElementById('policyForm');
    form.innerHTML = '';

    fetch(`/servers/policies/${document.getElementById('server_type').value}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const policy = typeof data.policy === 'string' ? JSON.parse(data.policy) : data.policy;
                const definition = serverType === 'emby' ? embyPolicyDefinition : jellyfinPolicyDefinition;

                Object.entries(definition).forEach(([_, section]) => {
                    const sectionDiv = createSection(section, policy);
                    form.appendChild(sectionDiv);
                });

                form.appendChild(createSubmitButton());
            }
        });
}

function createSection(section, policy) {
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

function createSubmitButton() {
    const div = document.createElement('div');
    div.className = 'row mt-4';
    div.innerHTML = `
        <div class="col-12">
            <button type="submit" class="btn btn-primary">Save Policy</button>
        </div>`;
    return div;
}

function handleFormSubmit(e) {
    e.preventDefault();
    const form = document.getElementById('policyForm');
    const serverType = document.getElementById('server_type').selectedOptions[0].text.toLowerCase();
    const definition = serverType === 'emby' ? embyPolicyDefinition : jellyfinPolicyDefinition;

    const policy = {
        ...getDefaultFixed(serverType),
        ...getDefaultArrays(serverType)
    };

    Object.entries(definition).forEach(([_, section]) => {
        Object.entries(section.fields).forEach(([key, field]) => {
            const element = document.getElementById(key);
            if (field.type === 'checkbox') {
                policy[key] = element.checked;
            } else if (field.type === 'number') {
                policy[key] = parseInt(element.value) || field.default;
            }
        });
    });

    fetch('/servers/policies', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        },
        body: JSON.stringify({
            server_type_id: document.getElementById('server_type').value,
            policies: JSON.stringify(policy)
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast('Policy saved successfully', 'success');
            } else {
                showToast(data.message || 'Error saving policy', 'danger');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Error saving policy', 'danger');
        });
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
