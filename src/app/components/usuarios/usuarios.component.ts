// lucaferrantedev/clubnet-frontend/ClubNet-Frontend-feature-GestionUsuarios/src/app/components/usuarios/usuarios.component.ts
import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service';

// Define las interfaces para la tipificación
interface UsuarioDTO {
  persona_id: number;
  nombre: string;
  apellido: string;
  dni: number;
  email: string;
  estado: boolean;
  rol_id: number;
}

interface Rol {
  rol_id: number;
  nombre: string;
}

@Component({
  selector: 'app-usuarios',
  imports: [CommonModule, NavbarComponent, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css',
  standalone: true
})
export class UsuariosComponent implements OnInit {

  usuarios: UsuarioDTO[] = [];
  roles: Rol[] = [];
  isLoading = true;
  isAdmin = false;

  // Para el modal de edición
  selectedUser: UsuarioDTO | null = null;
  userToEdit: any = {};
  showEditModal = false;
  
  // Mensajería general
  mensaje: string = '';
  mensajeTipo: 'success' | 'error' = 'success';
  
  // Para la creación de usuario
  newUser: any = {
    dni: null,
    nombre: '',
    apellido: '',
    rol: 3, 
    email: '',
    clave: '',
    confirmarClave: ''
  };

  // NUEVO: Propiedad para el modal de confirmación de eliminación
  userToDelete: UsuarioDTO | null = null; 

  // Para paginación
  pagedUsers: UsuarioDTO[] = [];
  pageSize: number = 10;
  currentPage: number = 1;

  constructor(private usuariosService: UsuariosService) { }

  ngOnInit(): void {
    this.checkAdminAndLoadData();
  }

  // Verifica el rol del usuario logueado (Rol ID 1 es Administrador)
  checkAdminAndLoadData() {
    const email = localStorage.getItem('email');
    if (email) {
      this.usuariosService.GetUsuario(email).subscribe({
        next: (user: any) => {
          this.isAdmin = user?.rol_id === 1; 
          if (this.isAdmin) {
            this.loadUsers();
            this.loadRoles();
          } else {
            this.isLoading = false;
            this.showMessage('Acceso denegado. Solo administradores pueden ver esta sección.', 'error');
          }
        },
        error: (err: any) => { 
          this.isLoading = false;
          this.showMessage('Error al verificar el rol de usuario.', 'error');
          console.error("Error al cargar datos del usuario:", err);
        }
      });
    } else {
      this.isLoading = false;
      this.showMessage('Usuario no autenticado.', 'error');
    }
  }

  loadUsers() {
    this.isLoading = true;
    this.usuariosService.GetUsuarios().subscribe({
      next: (data: any) => {
        this.usuarios = data as UsuarioDTO[];
        this.updatePagedUsers();
        this.isLoading = false;
      },
      error: (err: any) => { 
        this.isLoading = false;
        this.showMessage('Error al cargar los usuarios. Asegúrate de que tienes permisos.', 'error');
        console.error('Error al cargar usuarios:', err);
      }
    });
  }
  
  loadRoles() {
    this.usuariosService.GetRoles().subscribe({
      next: (data: any) => {
        this.roles = data as Rol[];
      },
      error: (err: any) => { 
        console.error('Error al cargar roles:', err);
      }
    });
  }

  // Lógica del modal de edición
  openEditModal(user: UsuarioDTO) {
    this.userToEdit = { ...user };
    this.showEditModal = true;
    this.mensaje = ''; 
  }

  closeEditModal() {
    this.showEditModal = false;
    this.userToEdit = {};
    this.mensaje = '';
  }

  updateUser() {
    const updatedUser: UsuarioDTO = {
      ...this.userToEdit,
      dni: Number(this.userToEdit.dni),
      rol_id: Number(this.userToEdit.rol_id),
      persona_id: Number(this.userToEdit.persona_id) 
    };
    
    this.usuariosService.UpdateUsuario(updatedUser).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.showMessage(`Usuario ${updatedUser.nombre} ${updatedUser.apellido} actualizado con éxito.`, 'success');
          this.loadUsers(); 
          setTimeout(() => this.closeEditModal(), 1500);
        } else {
          this.showMessage(res.message || 'Error al actualizar el usuario.', 'error');
        }
      },
      error: (err: any) => { 
        this.showMessage('Error de conexión o de servidor al actualizar el usuario.', 'error');
        console.error('Error al actualizar usuario:', err);
      }
    });
  }
  
  // Método: Crear Usuario
  createUser() {
    if (!this.newUser.dni || !this.newUser.nombre || !this.newUser.apellido || !this.newUser.email || !this.newUser.clave || !this.newUser.confirmarClave) {
      this.showMessage('Todos los campos son obligatorios.', 'error');
      return;
    }

    if (this.newUser.clave !== this.newUser.confirmarClave) {
      this.showMessage('Las claves no coinciden.', 'error');
      return;
    }

    const { confirmarClave, ...objToSend } = this.newUser;
    objToSend.dni = Number(objToSend.dni);
    objToSend.rol = Number(objToSend.rol);
    
    this.usuariosService.CreateUser(objToSend).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.showMessage('Usuario creado con éxito.', 'success');
          this.loadUsers();
          this.resetNewUserForm();
        } else {
          this.showMessage(res.message || 'Error al crear el usuario. El email o DNI podría estar en uso.', 'error');
        }
      },
      error: (err: any) => {
        this.showMessage('Error de conexión o de servidor al crear el usuario.', 'error');
        console.error('Error al crear usuario:', err);
      }
    });
  }
  
  // NUEVO: Pide confirmación para eliminar
  solicitarConfirmacionEliminar(user: UsuarioDTO) {
    this.userToDelete = user;
    this.mensaje = ''; 
  }

  // NUEVO: Cancela la eliminación
  cancelarEliminacion() {
    this.userToDelete = null;
  }

  // NUEVO: Ejecuta la eliminación (baja lógica)
  EliminarUsuario(persona_id: number) {
    this.userToDelete = null; 
    this.usuariosService.DeleteUser(persona_id).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.showMessage('Usuario dado de baja con éxito.', 'success');
          this.loadUsers(); 
        } else {
          this.showMessage(res.message || 'Error al dar de baja el usuario.', 'error');
        }
      },
      error: (err: any) => {
        this.showMessage('Error de conexión o de servidor al dar de baja el usuario.', 'error');
        console.error('Error al eliminar usuario:', err);
      }
    });
  }

  // Método: Resetear el formulario de creación
  resetNewUserForm() {
    this.newUser = {
      dni: null,
      nombre: '',
      apellido: '',
      rol: 3,
      email: '',
      clave: '',
      confirmarClave: ''
    };
  }
  
  // Método auxiliar para mensajes
  showMessage(message: string, type: 'success' | 'error') {
    this.mensaje = message;
    this.mensajeTipo = type;
    setTimeout(() => {
      this.mensaje = '';
    }, 3000);
  }

  // Funciones auxiliares para la tabla y edición
  getRoleName(rolId: number): string {
    return this.roles.find(r => r.rol_id === rolId)?.nombre || 'Desconocido';
  }
  
  // Lógica de paginación
  updatePagedUsers() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedUsers = this.usuarios.slice(startIndex, endIndex);
  }
  
  onPageChange(page: number) {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagedUsers();
    }
  }
  
  get totalPages(): number {
    return Math.ceil(this.usuarios.length / this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}