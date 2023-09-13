import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService } from './inventory.service';
import { verifyFileType } from 'src/app/utils/utils';
import { ToastrService } from 'ngx-toastr';
import { SubSink } from 'subsink';
import { ErrorResponse } from './inventory.model';
import { O2SelectComponent } from 'src/app/components/o2-select/o2-select.component';
import { IOption } from 'src/app/components/chip-selectbox/chip-selectbox.model';
import { FormsModule, NgForm } from '@angular/forms';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, O2SelectComponent, FormsModule],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss'],
})
export class InventoryComponent implements OnDestroy {
  fileOptions: IOption[] = [
    { display: 'Reset', value: 'RESET' },
    { display: 'Delta', value: 'DELTA' },
  ];
  selectedFileInput!: EventTarget | null;
  selectedOption!: string[];
  private inventoryService = inject(InventoryService);
  private toast = inject(ToastrService);
  private subs = new SubSink();
  fileTypes =
    '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel';

  get getOption() {
    return this.selectedOption[0];
  }

  get selectedFile() {
    const files = (this.selectedFileInput as HTMLInputElement)?.files ?? null;
    return files ? files[0] : null;
  }

  UploadFile(form: NgForm) {
    if (!this.selectedFile) {
      this.toast.warning('No file selected');
      return;
    }

    const isValidType = verifyFileType(
      this.selectedFile,
      this.fileTypes.split(','),
    );
    if (!isValidType) {
      this.toast.warning(
        'Only select files of type csv, xls or xslx',
        'Invalid file type!',
      );
      return;
    }

    this.subs.sink = this.inventoryService
      .getPreSignedUrlForUpload(this.selectedFile.name, this.getOption)
      .pipe(
        switchMap((resp) => {
          if (!resp.preSignedUrl || !this.selectedFile) {
            throw new Error('Something went wrong...');
          }
          return this.inventoryService.uploadFile(
            resp.preSignedUrl,
            this.selectedFile,
          );
        }),
        switchMap((resp) => {
          const checksum = resp.headers.get('ETag')?.replaceAll('"', '');
          if (!checksum || !this.selectedFile) {
            throw new Error('Something went wrong...');
          }
          return this.inventoryService.acknowledgeUpload(
            checksum,
            this.selectedFile.name,
            this.getOption,
          );
        }),
      )
      .subscribe({
        next: (data) => {
          if (data.status) {
            this.toast.success('Upload successful');
            (this.selectedFileInput as HTMLInputElement).value = '';
            form.resetForm();
          }
        },
        error: (err: ErrorResponse) => {
          console.log(err);
        },
      });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
