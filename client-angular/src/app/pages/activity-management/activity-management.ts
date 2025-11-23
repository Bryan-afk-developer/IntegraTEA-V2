import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { fadeInAnimation } from '../../animations';
import { Activity, ActivityService } from '../../core/api/activity.service';
import { Pictogram, PictogramService } from '../../core/api/pictogram.service';
import { User, UserService, Child } from '../../core/api/user.service'; // Reusamos el user service para los niños

@Component({
  selector: 'app-activity-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './activity-management.html',
  styleUrl: './activity-management.scss',
  animations: [fadeInAnimation]
})
export class ActivityManagementComponent implements OnInit {

  // Estados de la Vista
  isLoading = true;
  isModalOpen = false;
  modalMode: 'add' | 'edit' | 'delete' = 'add';

  // Datos
  allActivities: Activity[] = [];
  filteredActivities: Activity[] = [];
  allChildren: Child[] = []; // Para el <select>
  allPictograms: Pictogram[] = []; // Para el selector

  activityForm: FormGroup;
  activityToDelete: Activity | null = null;
  formError = '';

  // Estado para modal de subir pictograma
  isPictogramModalOpen = false;
  newPictogram = { name: '', category: 'acciones' };
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private activityService: ActivityService,
    private userService: UserService, // Para obtener niños
    private pictogramService: PictogramService // Para obtener pictogramas
  ) {
    this.activityForm = this.fb.group({
      _id: [null],
      childId: [null, Validators.required],
      status: ['asignada', Validators.required],
      score: [null],
      // Usamos un FormArray para los checkboxes de pictogramas
      pictogramIds: this.fb.array([], [Validators.required, Validators.minLength(6), Validators.maxLength(6)])
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.isLoading = true;
    forkJoin({
      activities: this.activityService.getActivities(),
      children: this.userService.getChildren(), // Reusamos el service de User
      pictograms: this.pictogramService.getPictograms()
    }).subscribe({
      next: (data) => {
        this.allActivities = data.activities;
        this.filteredActivities = data.activities;
        this.allChildren = data.children;
        this.allPictograms = data.pictograms;

        // Llenamos el FormArray de pictogramas (solo la estructura)
        this.buildPictogramCheckboxes();

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading initial data:', err);
        alert('Error al cargar datos. ¿Iniciaste sesión?');
        this.isLoading = false;
      }
    });
  }

  // --- Lógica de Filtro ---
  onFilter(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredActivities = this.allActivities.filter(act =>
      (act.childId?.firstName?.toLowerCase().includes(searchTerm) || act.childId?.lastName?.toLowerCase().includes(searchTerm)) ||
      act.status.toLowerCase().includes(searchTerm)
    );
  }

  // --- Lógica de Modales ---
  openModal(mode: 'add' | 'edit' | 'delete', activity: Activity | null = null): void {
    this.formError = '';
    this.activityForm.reset();
    this.activityForm.patchValue({ status: 'asignada' }); // Valor por defecto
    this.getPictogramFormArray().clear(); // Limpiamos checkboxes
    this.buildPictogramCheckboxes(); // Re-creamos checkboxes

    this.modalMode = mode;

    if (mode === 'edit' && activity) {
      this.setupForm(activity);
    } else if (mode === 'delete' && activity) {
      this.activityToDelete = activity;
    }

    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.activityToDelete = null;
  }

  // --- Lógica de Formularios ---

  // Helper para obtener el FormArray
  getPictogramFormArray(): FormArray {
    return this.activityForm.get('pictogramIds') as FormArray;
  }

  // Crea la lista de checkboxes
  buildPictogramCheckboxes(selectedIds: string[] = []): void {
    const formArray = this.getPictogramFormArray();
    formArray.clear();

    this.allPictograms.forEach(picto => {
      const isSelected = selectedIds.some(id => id === picto._id);
      formArray.push(this.fb.control(isSelected));
    });
  }

  // Actualiza el FormArray cuando se selecciona/deselecciona
  onPictogramChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const formArray = this.getPictogramFormArray();

    // Contamos cuántos están seleccionados
    const selectedCount = formArray.controls.filter(control => control.value).length;

    // Lógica para limitar a 6
    if (selectedCount > 6) {
      checkbox.checked = false; // Desmarcamos el que acaba de marcar

      // Encontramos el índice del checkbox en la lista de pictogramas
      const labelElement = checkbox.parentElement as HTMLLabelElement;
      const spanElement = labelElement.querySelector('span');
      const pictoName = spanElement ? spanElement.innerText : '';
      const index = this.allPictograms.findIndex(p => p.name === pictoName);

      if (index !== -1) {
        formArray.at(index).setValue(false);
      }
      alert('Solo puedes seleccionar un máximo de 6 pictogramas.');
    }
  }

  setupForm(activity: Activity): void {
    this.activityForm.patchValue({
      _id: activity._id,
      childId: (activity.childId as any)._id || activity.childId,
      status: activity.status,
      score: activity.score
    });

    const selectedPictoIds = activity.pictogramIds.map((p: any) => p._id || p);
    this.buildPictogramCheckboxes(selectedPictoIds);
  }

  onActivitySubmit(): void {
    if (this.activityForm.invalid) {
      this.formError = 'Por favor, completa los campos requeridos (Niño y 6 Pictogramas).';
      return;
    }
    this.formError = '';

    const selectedPictogramIds = this.activityForm.value.pictogramIds
      .map((checked: boolean, i: number) => checked ? this.allPictograms[i]._id : null)
      .filter((id: string | null) => id !== null);

    const formData = {
      ...this.activityForm.value,
      pictogramIds: selectedPictogramIds
    };

    if (formData.status === 'asignada') {
      formData.score = null;
    }

    const selectedChild = this.allChildren.find(c => c._id === formData.childId);
    if (selectedChild) {
      formData.educatorId = (selectedChild as any).educatorId;
    }

    const apiCall = formData._id
      ? this.activityService.updateActivity(formData._id, formData)
      : this.activityService.createActivity(formData);

    apiCall.subscribe({
      next: () => {
        this.loadInitialData();
        this.closeModal();
      },
      error: (err) => {
        this.formError = err.error?.message || 'Error al guardar la actividad.';
        console.error('Error saving activity:', err);
      }
    });
  }

  onDeleteConfirm(): void {
    if (!this.activityToDelete) return;

    this.activityService.deleteActivity(this.activityToDelete._id).subscribe({
      next: () => {
        this.loadInitialData();
        this.closeModal();
      },
      error: (err) => {
        this.formError = err.error?.message || 'Error al eliminar la actividad.';
        console.error('Error deleting activity:', err);
      }
    });
  }

  // --- Métodos para subir pictogramas ---

  openPictogramUploadModal(): void {
    this.isPictogramModalOpen = true;
    this.newPictogram = { name: '', category: 'acciones' };
    this.selectedFile = null;
    this.imagePreview = null;
  }

  closePictogramModal(): void {
    this.isPictogramModalOpen = false;
    this.newPictogram = { name: '', category: 'acciones' };
    this.selectedFile = null;
    this.imagePreview = null;
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];

    if (this.selectedFile) {
      // Vista previa de la imagen
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onPictogramUpload(): void {
    if (!this.selectedFile || !this.newPictogram.name || !this.newPictogram.category) {
      alert('Por favor completa todos los campos');
      return;
    }

    this.pictogramService.createPictogram(
      this.newPictogram.name,
      this.newPictogram.category,
      this.selectedFile
    ).subscribe({
      next: (createdPictogram) => {
        alert('✅ Pictograma subido exitosamente!');
        this.loadInitialData(); // Recargar pictogramas disponibles
        this.closePictogramModal();
      },
      error: (err) => {
        alert('❌ Error al subir pictograma');
        console.error('Error uploading pictogram:', err);
      }
    });
  }
}
