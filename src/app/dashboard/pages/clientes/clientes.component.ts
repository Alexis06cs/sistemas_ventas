import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Cliente {
  id: number;
  nombre: string;
  cargo: string;
  email: string;
  rol: 'ADMIN' | 'VENDEDOR' | 'CLIENTE' | string;
  empresa?: string;
  avatarUrl?: string;
}

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css'] // corregido: styleUrls (array)
})
export class ClientesComponent {
  clientes: Cliente[] = [
    {
      id: 1,
      nombre: 'Lindsay Walton',
      cargo: 'Front-end Developer',
      email: 'lindsay.walton@example.com',
      rol: 'CLIENTE',
      empresa: 'Tech Solutions',
      avatarUrl: 'https://i.pravatar.cc/80?u=lindsay.walton@example.com'
    },
    {
      id: 2,
      nombre: 'Courtney Henry',
      cargo: 'Designer',
      email: 'courtney.henry@example.com',
      rol: 'ADMIN',
      empresa: 'Creative Studio',
      avatarUrl: 'https://i.pravatar.cc/80?u=courtney.henry@example.com'
    },
    {
      id: 3,
      nombre: 'Tom Cook',
      cargo: 'Director of Product',
      email: 'tom.cook@example.com',
      rol: 'CLIENTE',
      empresa: 'Global Corp',
      avatarUrl: 'https://i.pravatar.cc/80?u=tom.cook@example.com'
    }
  ];

  trackByClienteId = (_: number, cliente: Cliente) => cliente.id;

  onAddCliente(): void {
    console.log('Agregar cliente');
    // Aquí abrir modal/formulario para añadir cliente
  }

  onEditCliente(cliente: Cliente): void {
    console.log('Editar cliente:', cliente);
    // Aquí abrir modal/formulario para editar cliente
  }
}
