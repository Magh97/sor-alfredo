import bcryptjs from 'bcryptjs';
import { UsersRepository } from './users.repository.js';
import { AppError } from '../../shared/errors.js';
import type { CreateUserInput, UpdateUserInput } from './users.schema.js';

export class UsersService {
  static async create(restaurantId: number, input: CreateUserInput) {
    const existing = await UsersRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError('CONFLICT', 'Ya existe un usuario con ese email', 409);
    }

    const passwordHash = await bcryptjs.hash(input.password, 10);
    const user = await UsersRepository.create({
      ...input,
      restaurantId,
      passwordHash,
    });

    return user;
  }

  static async update(id: number, restaurantId: number, input: UpdateUserInput) {
    const user = await UsersRepository.findById(id, restaurantId);
    if (!user) {
      throw new AppError('NOT_FOUND', 'Usuario no encontrado', 404);
    }

    if (input.email && input.email !== user.email) {
      const existing = await UsersRepository.findByEmail(input.email);
      if (existing) {
        throw new AppError('CONFLICT', 'Ya existe un usuario con ese email', 409);
      }
    }

    const data: UpdateUserInput & { passwordHash?: string } = { ...input };
    if (input.password) {
      data.passwordHash = await bcryptjs.hash(input.password, 10);
      delete (data as { password?: string }).password;
    }

    const updated = await UsersRepository.update(id, restaurantId, data);
    return updated;
  }

  static async deactivate(id: number, restaurantId: number) {
    const user = await UsersRepository.findById(id, restaurantId);
    if (!user) {
      throw new AppError('NOT_FOUND', 'Usuario no encontrado', 404);
    }

    return UsersRepository.softDelete(id, restaurantId);
  }
}
