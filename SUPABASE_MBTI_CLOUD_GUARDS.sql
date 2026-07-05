begin;

-- Tool48 MBTI cloud-save guards.
-- Safe to run more than once in Supabase SQL Editor.
-- Limits new result rows to 10 per rolling 24 hours and caps JSON payload size.

create or replace function public.tool48_enforce_personality_result_guards()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.user_id is null then
    raise exception 'tool48_mbti_cloud_result_user_missing';
  end if;

  if pg_column_size(new.payload) > 131072
    or pg_column_size(new.score_data) > 65536
    or pg_column_size(new.answers) > 65536 then
    raise exception 'tool48_mbti_payload_too_large';
  end if;

  if tg_op = 'INSERT' and (
    select count(*)
    from public.personality_results
    where user_id = new.user_id
      and created_at >= now() - interval '24 hours'
  ) >= 10 then
    raise exception 'tool48_mbti_daily_insert_limit_reached';
  end if;

  return new;
end;
$$;

drop trigger if exists tool48_personality_result_guards_before_insert on public.personality_results;
drop trigger if exists tool48_personality_result_guards_before_write on public.personality_results;
create trigger tool48_personality_result_guards_before_write
before insert or update on public.personality_results
for each row execute function public.tool48_enforce_personality_result_guards();

notify pgrst, 'reload schema';

commit;
