-- Atomic upsert + increment for usage_daily
create or replace function increment_usage(
  p_user_id uuid,
  p_date    date,
  p_field   text,
  p_amount  integer
) returns void language plpgsql security definer as $$
begin
  insert into usage_daily (user_id, date, message_count, voice_seconds, document_count, tokens_total)
  values (p_user_id, p_date, 0, 0, 0, 0)
  on conflict (user_id, date) do nothing;

  if p_field = 'message_count' then
    update usage_daily set message_count = message_count + p_amount
    where user_id = p_user_id and date = p_date;
  elsif p_field = 'voice_seconds' then
    update usage_daily set voice_seconds = voice_seconds + p_amount
    where user_id = p_user_id and date = p_date;
  elsif p_field = 'document_count' then
    update usage_daily set document_count = document_count + p_amount
    where user_id = p_user_id and date = p_date;
  elsif p_field = 'tokens_total' then
    update usage_daily set tokens_total = tokens_total + p_amount
    where user_id = p_user_id and date = p_date;
  end if;
end;
$$;
