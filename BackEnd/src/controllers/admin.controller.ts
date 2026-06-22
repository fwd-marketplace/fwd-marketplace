import type { Request, Response } from "express";
import { z } from "zod";
import { ApiError } from "../utils/ApiError";
import { parseBody } from "../utils/parseBody";
import { CreateUserSchema, UpdateUserSchema } from "../validations/adminUser";
import { CreateCompanySchema, UpdateCompanySchema } from "../validations/adminCompany";
import {
  listPendingUsers,
  approveUser,
  rejectUser,
  suspendUser,
  listAllUsers,
  getUserDetail,
  createUser,
  updateUser,
  deleteUser,
  listAllCompanies,
  createCompany,
  updateCompany,
  listAllProjects,
  cancelProject,
  listAllStudents,
  listPendingStudents,
  verifyStudent,
  rejectStudent,
} from "../services/admin.service";

function getToken(req: Request): string {
  if (!req.accessToken) throw new ApiError(401, "No autenticado");
  return req.accessToken;
}

function readUuid(value: unknown, label: string): string {
  const parsed = z.string().uuid().safeParse(value);
  if (!parsed.success) throw new ApiError(400, `El id ${label} no es válido`);
  return parsed.data;
}

/** GET /api/admin/users/pending */
export async function listPending(req: Request, res: Response) {
  const users = await listPendingUsers(getToken(req));
  res.status(200).json({ users });
}

/** PATCH /api/admin/users/:id/aprobar */
export async function approve(req: Request, res: Response) {
  const id = readUuid(req.params.id, "del usuario");
  const user = await approveUser(getToken(req), id);
  res.status(200).json({ user });
}

/** PATCH /api/admin/users/:id/rechazar */
export async function reject(req: Request, res: Response) {
  const id = readUuid(req.params.id, "del usuario");
  const user = await rejectUser(getToken(req), id);
  res.status(200).json({ user });
}

/** PATCH /api/admin/users/:id/suspender */
export async function suspend(req: Request, res: Response) {
  const id = readUuid(req.params.id, "del usuario");
  const user = await suspendUser(getToken(req), id);
  res.status(200).json({ user });
}

/** GET /api/admin/users (todos los usuarios — gestión) */
export async function listAll(req: Request, res: Response) {
  const users = await listAllUsers(getToken(req));
  res.status(200).json({ users });
}

/** GET /api/admin/users/:id (detalle con perfil para el modal "Ver") */
export async function detail(req: Request, res: Response) {
  const id = readUuid(req.params.id, "del usuario");
  const user = await getUserDetail(getToken(req), id);
  res.status(200).json({ user });
}

/** POST /api/admin/users (alta de cuenta base + rol) */
export async function create(req: Request, res: Response) {
  const input = parseBody(CreateUserSchema, req.body);
  const user = await createUser(input);
  res.status(201).json({ user });
}

/** PATCH /api/admin/users/:id (edición de datos base) */
export async function update(req: Request, res: Response) {
  const id = readUuid(req.params.id, "del usuario");
  const input = parseBody(UpdateUserSchema, req.body);
  const user = await updateUser(getToken(req), id, input);
  res.status(200).json({ user });
}

/** DELETE /api/admin/users/:id (elimina cuenta + perfiles en cascada) */
export async function remove(req: Request, res: Response) {
  if (!req.user) throw new ApiError(401, "No autenticado");
  const id = readUuid(req.params.id, "del usuario");
  await deleteUser(req.user.id, id);
  res.status(204).send();
}

/** GET /api/admin/companies (todas las empresas — gestión) */
export async function listCompanies(req: Request, res: Response) {
  const companies = await listAllCompanies(getToken(req));
  res.status(200).json({ companies });
}

/** POST /api/admin/companies (alta de cuenta company + perfil empresario mínimo) */
export async function createCompanyController(req: Request, res: Response) {
  getToken(req);
  const input = parseBody(CreateCompanySchema, req.body);
  const company = await createCompany(input);
  res.status(201).json({ company });
}

/** PATCH /api/admin/companies/:id (edición del perfil empresario; :id = empresario.id) */
export async function updateCompanyController(req: Request, res: Response) {
  getToken(req);
  const id = readUuid(req.params.id, "de la empresa");
  const input = parseBody(UpdateCompanySchema, req.body);
  const company = await updateCompany(id, input);
  res.status(200).json({ company });
}

/** GET /api/admin/projects */
export async function listProjects(req: Request, res: Response) {
  const projects = await listAllProjects(getToken(req));
  res.status(200).json({ projects });
}

/** PATCH /api/admin/projects/:id/cancelar */
export async function cancel(req: Request, res: Response) {
  const id = readUuid(req.params.id, "del proyecto");
  const project = await cancelProject(getToken(req), id);
  res.status(200).json({ project });
}

/** GET /api/admin/students (todos los estudiantes — vista Talento) */
export async function listStudents(req: Request, res: Response) {
  const students = await listAllStudents(getToken(req));
  res.status(200).json({ students });
}

/** GET /api/admin/students/pending (egresados FWD por verificar) */
export async function listPendingEgresados(req: Request, res: Response) {
  const students = await listPendingStudents(getToken(req));
  res.status(200).json({ students });
}

/** PATCH /api/admin/students/:id/verificar (:id = estudiante.id) */
export async function verifyEgresado(req: Request, res: Response) {
  const id = readUuid(req.params.id, "del estudiante");
  const student = await verifyStudent(getToken(req), id);
  res.status(200).json({ student });
}

/** PATCH /api/admin/students/:id/rechazar (:id = estudiante.id) */
export async function rejectEgresado(req: Request, res: Response) {
  const id = readUuid(req.params.id, "del estudiante");
  const student = await rejectStudent(getToken(req), id);
  res.status(200).json({ student });
}
