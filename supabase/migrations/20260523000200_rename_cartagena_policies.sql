begin;

drop policy if exists "cartagena_usuario_usuario_select_own" on public.cartagena_usuario_usuario;
create policy "cartagena_usuario_usuario_select_own"
on public.cartagena_usuario_usuario
for select
to authenticated
using (auth.uid() = id or public.is_admin_user());

drop policy if exists "cartagena_usuario_usuario_update_own" on public.cartagena_usuario_usuario;
create policy "cartagena_usuario_usuario_update_own"
on public.cartagena_usuario_usuario
for update
to authenticated
using (auth.uid() = id or public.is_admin_user())
with check (auth.uid() = id or public.is_admin_user());

drop trigger if exists set_profiles_updated_at on public.cartagena_usuario_usuario;
create trigger set_cartagena_usuario_usuario_updated_at
before update on public.cartagena_usuario_usuario
for each row
execute function public.set_updated_at();

drop trigger if exists prevent_profile_role_changes_trigger on public.cartagena_usuario_usuario;
create trigger prevent_cartagena_usuario_usuario_role_changes_trigger
before update on public.cartagena_usuario_usuario
for each row
execute function public.prevent_profile_role_changes();

drop policy if exists "documents_select_available" on public.cartagena_producto_producto;
create policy "cartagena_producto_producto_select_available"
on public.cartagena_producto_producto
for select
to public
using (
  status = 'disponible'::public.document_status
  or public.is_admin_user()
  or public.is_moderator_user()
);

drop policy if exists "documents_insert_student_own" on public.cartagena_producto_producto;
create policy "cartagena_producto_producto_insert_student_own"
on public.cartagena_producto_producto
for insert
to authenticated
with check (
  owner_id = auth.uid()
  and status = 'disponible'::public.document_status
  and (
    public.current_user_role() = 'estudiante'::public.user_role
    or public.is_admin_user()
  )
);

drop policy if exists "documents_update_student_own" on public.cartagena_producto_producto;
create policy "cartagena_producto_producto_update_student_own"
on public.cartagena_producto_producto
for update
to authenticated
using (
  owner_id = auth.uid()
  and status = 'disponible'::public.document_status
  and public.current_user_role() = 'estudiante'::public.user_role
)
with check (
  owner_id = auth.uid()
  and public.current_user_role() = 'estudiante'::public.user_role
);

drop policy if exists "documents_update_moderator" on public.cartagena_producto_producto;
create policy "cartagena_producto_producto_update_moderator"
on public.cartagena_producto_producto
for update
to authenticated
using (public.is_moderator_user())
with check (public.is_moderator_user());

drop policy if exists "documents_update_admin" on public.cartagena_producto_producto;
create policy "cartagena_producto_producto_update_admin"
on public.cartagena_producto_producto
for update
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "documents_delete_student_own" on public.cartagena_producto_producto;
create policy "cartagena_producto_producto_delete_student_own"
on public.cartagena_producto_producto
for delete
to authenticated
using (
  owner_id = auth.uid()
  and status = 'disponible'::public.document_status
  and public.current_user_role() = 'estudiante'::public.user_role
);

drop policy if exists "documents_delete_admin" on public.cartagena_producto_producto;
create policy "cartagena_producto_producto_delete_admin"
on public.cartagena_producto_producto
for delete
to authenticated
using (public.is_admin_user());

drop trigger if exists set_documents_updated_at on public.cartagena_producto_producto;
create trigger set_cartagena_producto_producto_updated_at
before update on public.cartagena_producto_producto
for each row
execute function public.set_updated_at();

drop trigger if exists prevent_document_permission_bypass_trigger on public.cartagena_producto_producto;
create trigger prevent_cartagena_producto_producto_permission_bypass_trigger
before update on public.cartagena_producto_producto
for each row
execute function public.prevent_document_permission_bypass();

commit;
