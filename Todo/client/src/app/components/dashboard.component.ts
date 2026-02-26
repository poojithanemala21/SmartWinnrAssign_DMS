import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../services/document.service';
import { AuthService } from '../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  documents: any[] = [];
  user: any;
  searchQuery = '';
  searchTags = '';
  showUpload = false;

  uploadTitle = '';
  uploadDesc = '';
  uploadTags = '';
  selectedFile: File | null = null;
  error = '';
  success = '';
  isFetching = false;
  isUploading = false;
  users: any[] = [];
  showPermissions = false;
  selectedDoc: any = null;
  permUserId = '';
  permAccess = 'viewer';
  dashboardSuccess = '';
  successTimeout: any = null;
  private subscriptions: Subscription[] = [];

  constructor(private docService: DocumentService, private authService: AuthService) {
    this.user = this.authService.currentUserValue;
  }

  ngOnInit() {
    this.loadDocuments();
    this.loadUsers();
  }

  ngOnDestroy() {
    // Unsubscribe from all subscriptions to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.successTimeout) {
      clearTimeout(this.successTimeout);
    }
  }

  loadUsers() {
    const usersSub = this.authService.getUsers().subscribe(users => this.users = users);
    this.subscriptions.push(usersSub);
  }

  loadDocuments() {
    this.isFetching = true;
    const docsSub = this.docService.getDocuments().subscribe({
      next: (docs) => {
        this.documents = docs;
        this.isFetching = false;
      },
      error: () => this.isFetching = false
    });
    this.subscriptions.push(docsSub);
  }

  onSearch() {
    if (!this.searchQuery && !this.searchTags) {
      this.loadDocuments();
      return;
    }
    this.isFetching = true;
    const searchSub = this.docService.searchDocuments(this.searchQuery, this.searchTags).subscribe({
      next: (docs) => {
        this.documents = docs;
        this.isFetching = false;
      },
      error: () => this.isFetching = false
    });
    this.subscriptions.push(searchSub);
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onUpload() {
    if (!this.selectedFile) {
      this.error = 'Please select a file';
      return;
    }

    if (!this.uploadTitle.trim()) {
      this.error = 'Please enter a document title';
      return;
    }

    console.log('\n📤 ========== UPLOAD INITIATED ==========');
    console.log('📄 File:', this.selectedFile.name);
    console.log('📄 File Size:', (this.selectedFile.size / 1024).toFixed(2), 'KB');
    console.log('📝 Title:', this.uploadTitle);
    console.log('📝 Description:', this.uploadDesc);
    console.log('🏷️  Tags:', this.uploadTags);

    this.isUploading = true;
    this.error = '';
    this.success = '';

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('title', this.uploadTitle.trim());
    formData.append('description', this.uploadDesc.trim() || '');
    formData.append('tags', this.uploadTags.trim() || '');

    console.log('📤 FormData created, sending to server...');

    const uploadSub = this.docService.uploadDocument(formData).subscribe({
      next: (response) => {
        console.log('\n✅ ========== UPLOAD RESPONSE RECEIVED ==========');
        console.log('Response Type:', typeof response);
        console.log('Response Keys:', Object.keys(response || {}));
        console.log('Full Response:', response);
        console.log('✅ ==========================================\n');

        this.isUploading = false;

        // Handle both old and new response formats
        if (response?.success === true || response?.id) {
          console.log('✅ Upload confirmed as successful');
          this.success = `✅ Successfully uploaded "${this.uploadTitle}"!`;
          
          // Reload documents
          this.isFetching = true;
          console.log('🔄 Reloading document list...');

          const reloadSub = this.docService.getDocuments().subscribe({
            next: (docs) => {
              console.log('✅ Documents reloaded. Count:', docs.length);
              this.documents = docs;
              this.isFetching = false;
              
              // Show success message at dashboard level too
              this.dashboardSuccess = `✅ "${this.uploadTitle}" uploaded successfully!`;
              console.log('📢 Dashboard success message shown');
              
              // Close modal after a longer delay to ensure documents are loaded
              console.log('⏱️  Waiting 3 seconds before closing modal...');
              setTimeout(() => {
                this.resetUploadForm();
              }, 3000);
            },
            error: (err) => {
              console.error('❌ Error reloading documents:', err);
              this.isFetching = false;
              // Still close modal even if reload fails
              setTimeout(() => {
                this.resetUploadForm();
              }, 2000);
            }
          });
          this.subscriptions.push(reloadSub);
        } else {
          console.error('❌ Response received but structure unexpected');
          this.error = '⚠️ Upload completed but response was unexpected. Try refreshing the page.';
          this.isUploading = false;
        }
      },
      error: (err) => {
        console.error('\n❌ ========== UPLOAD ERROR ==========');
        console.error('Error Status:', err.status);
        console.error('Error Type:', err.error?.type);
        console.error('Error Message:', err.error?.message);
        console.error('Full Error:', err);
        console.error('❌ ===================================\n');

        this.isUploading = false;
        
        // Provide specific error messages
        let errorMsg = 'Upload failed. ';
        if (err.status === 401) {
          errorMsg += 'Your session has expired. Please refresh and log in again.';
        } else if (err.status === 400) {
          errorMsg += err.error?.message || 'Invalid file or form data.';
        } else if (err.status === 413) {
          errorMsg += 'File is too large. Maximum size is 100MB.';
        } else if (err.status === 0) {
          errorMsg += 'Connection failed. Please check if the server is running.';
        } else {
          errorMsg += err.error?.message || 'Unknown error occurred.';
        }

        this.error = '❌ ' + errorMsg;
      }
    });
    this.subscriptions.push(uploadSub);
  }

  resetUploadForm() {
    this.showUpload = false;
    this.isUploading = false;
    this.uploadTitle = '';
    this.uploadDesc = '';
    this.uploadTags = '';
    this.selectedFile = null;
    this.error = '';
    this.success = '';
    
    // Clear dashboard success message after a delay
    if (this.successTimeout) {
      clearTimeout(this.successTimeout);
    }
    this.successTimeout = setTimeout(() => {
      this.dashboardSuccess = '';
    }, 5000);
  }

  openVersionUpdate(doc: any) {
    console.log('🔧 openVersionUpdate called for', doc.id, doc.title);
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) {
        console.log('No file selected for version update');
        return;
      }

      console.log('📄 Selected file for version update:', file.name, file.size);
      const formData = new FormData();
      formData.append('file', file);

      const versionUpdateSub = this.docService.updateVersion(doc.id, formData).subscribe({
        next: (res) => {
          console.log('✔️ Version update response:', res);
          this.loadDocuments();
          // Optionally show a notification
          this.dashboardSuccess = `Document \"${doc.title}\" updated to new version!`;
        },
        error: (err) => {
          console.error('❌ Version update failed:', err);
          alert(err.error?.message || 'Version update failed');
        }
      });
      this.subscriptions.push(versionUpdateSub);
    };
    fileInput.click();
  }

  logout() {
    this.authService.logout();
    window.location.reload();
  }

  openPermissions(doc: any) {
    this.selectedDoc = doc;
    this.showPermissions = true;
  }

  updatePermission() {
    if (!this.permUserId) return;
    const permSub = this.docService.updatePermissions(this.selectedDoc.id, this.permUserId, this.permAccess).subscribe({
      next: () => {
        alert('Permission updated successfully');
        this.showPermissions = false;
        this.loadDocuments();
      },
      error: (err) => alert(err.error?.message || 'Failed to update permission')
    });
    this.subscriptions.push(permSub);
  }

  loadVersionHistory(doc: any) {
    this.selectedDoc = doc;
    const versionSub = this.docService.getVersionHistory(doc.id).subscribe(versions => {
      this.selectedDoc.versions = versions;
      this.showVersions = true;
    });
    this.subscriptions.push(versionSub);
  }

  showVersions = false;
}
