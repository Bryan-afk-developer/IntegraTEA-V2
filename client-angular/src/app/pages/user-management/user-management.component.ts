import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // Para formularios
import { forkJoin, Observable } from 'rxjs'; // Para combinar observables
import { fadeInAnimation } from '../../animations';
import { User, UserService, Educator } from '../../core/api/user.service'; // Importamos el servicio y los tipos

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,         // Para @if, @for
    ReactiveFormsModule // Para [formGroup]
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
  animations: [fadeInAnimation]
})
export class UserManagementComponent implements OnInit {

  // --- Estados de la Vista ---
  isLoading = true;
  isModalOpen = false;
  modalMode: 'addRole' | 'addEducator' | 'addChild' | 'editEducator' | 'editChild' | 'delete' = 'addRole';
  
  // --- Datos ---
  allUsers: User[] = [];
  allEducators: Educator[] = []; // Para el <select> del formulario de niño
  filteredUsers: User[] = [];
  userForm: FormGroup;
  userToDelete: User | null = null;
  formError = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {
    // Inicializamos el formulario reactivo
    this.userForm = this.fb.group({
      // Campos comunes
      _id: [null],
      role: [''],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      // Campos de Educador
      email: ['', Validators.email],
      password: [''],
      school: [''],
      // Campos de Niño
      age: [null],
      educatorId: [null]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    // Hacemos ambas llamadas a la API al mismo tiempo
    forkJoin({
      educators: this.userService.getEducators(),
      children: this.userService.getChildren()
    }).subscribe({
      next: (data) => {
        // Asignamos roles antes de combinar
        const educatorsWithRole = data.educators.map(e => ({ ...e, role: 'Educador' as const }));
        const childrenWithRole = data.children.map(c => ({ ...c, role: 'Niño' as const }));
        
        this.allEducators = educatorsWithRole; // Guardamos educadores para el <select>
        this.allUsers = [...educatorsWithRole, ...childrenWithRole];
        this.filteredUsers = this.allUsers;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading users:', err);
        alert('Error al cargar usuarios. ¿Iniciaste sesión?');
        this.isLoading = false;
      }
    });
  }

  // --- Lógica de Filtro ---
  onFilter(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredUsers = this.allUsers.filter(user =>
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm) ||
      user.role.toLowerCase().includes(searchTerm)
    );
  }

  // --- Lógica de Modales ---
  openModal(mode: 'addRole' | 'edit' | 'delete', user: User | null = null): void {
    this.formError = '';
    this.userForm.reset(); // Limpiamos el formulario

    if (mode === 'addRole') {
      this.modalMode = 'addRole';
    } 
    else if (mode === 'edit' && user) {
      this.modalMode = user.role === 'Educador' ? 'editEducator' : 'editChild';
      this.setupForm(user);
    } 
    else if (mode === 'delete' && user) {
      this.modalMode = 'delete';
      this.userToDelete = user;
    }
    
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.userToDelete = null;
  }

  // --- Lógica de Formularios ---
  setModalMode(mode: 'addEducator' | 'addChild'): void {
    this.modalMode = mode;
    this.setupForm(); // Configura validadores para el modo
  }

  setupForm(user: User | null = null): void {
    const isEducator = this.modalMode === 'addEducator' || this.modalMode === 'editEducator';
    const isNew = this.modalMode === 'addEducator' || this.modalMode === 'addChild';

    // Limpiar validadores anteriores
    this.userForm.get('email')?.clearValidators();
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('school')?.clearValidators();
    this.userForm.get('age')?.clearValidators();
    this.userForm.get('educatorId')?.clearValidators();
    
    if (isEducator) {
      this.userForm.get('email')?.setValidators([Validators.required, Validators.email]);
      this.userForm.get('school')?.setValidators(Validators.required);
      if (isNew) {
        this.userForm.get('password')?.setValidators(Validators.required);
      }
    } else { // Es Niño
      this.userForm.get('age')?.setValidators([Validators.required, Validators.min(0)]);
      this.userForm.get('educatorId')?.setValidators(Validators.required);
    }

    // Actualizar validadores
    this.userForm.updateValueAndValidity();

    // Si estamos editando (user no es null), llenamos el formulario
    if (user) {
      this.userForm.patchValue(user);
    }
  }

  onUserSubmit(): void {
    if (this.userForm.invalid) {
      this.formError = 'Por favor, completa todos los campos requeridos.';
      return;
    }
    this.formError = '';
    
    const formData = this.userForm.value;
    const isEducator = this.modalMode === 'addEducator' || this.modalMode === 'editEducator';
    let apiCall: Observable<any>;

    if (isEducator) {
      // Si es edición y no se puso password, no lo mandamos
      if (this.modalMode === 'editEducator' && !formData.password) {
        delete formData.password;
      }
      apiCall = formData._id
        ? this.userService.updateEducator(formData._id, formData)
        : this.userService.createEducator(formData);
    } else { // Es Niño
      apiCall = formData._id
        ? this.userService.updateChild(formData._id, formData)
        : this.userService.createChild(formData);
    }

    apiCall.subscribe({
      next: () => {
        this.loadUsers(); // Recargamos la tabla
        this.closeModal();
      },
      error: (err) => {
        this.formError = err.error?.message || 'Error al guardar el usuario.';
        console.error('Error saving user:', err);
      }
    });
  }

  onDeleteConfirm(): void {
    if (!this.userToDelete) return;

    const apiCall: Observable<any> = this.userToDelete.role === 'Educador'
      ? this.userService.deleteEducator(this.userToDelete._id)
      : this.userService.deleteChild(this.userToDelete._id);

    apiCall.subscribe({
      next: () => {
        this.loadUsers(); // Recargamos la tabla
        this.closeModal();
      },
      error: (err) => {
        this.formError = err.error?.message || 'Error al eliminar el usuario.';
        console.error('Error deleting user:', err);
      }
    });
  }
}