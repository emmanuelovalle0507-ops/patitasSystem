-- ============================================================
-- PatiTas - Setup PostGIS
-- Ejecuta este SQL en Supabase (SQL editor) DESPUÉS de `prisma migrate deploy`.
-- Añade columna geography + trigger para mantenerla sincronizada con lat/lng,
-- y función helper para consultas por radio.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS postgis;

-- -------- Post.geog --------
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS geog geography(Point, 4326);
UPDATE "Post" SET geog = ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
  WHERE lat IS NOT NULL AND lng IS NOT NULL AND geog IS NULL;
CREATE INDEX IF NOT EXISTS post_geog_idx ON "Post" USING GIST (geog);

CREATE OR REPLACE FUNCTION post_sync_geog() RETURNS trigger AS $$
BEGIN
  IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL THEN
    NEW.geog := ST_SetSRID(ST_MakePoint(NEW.lng, NEW.lat), 4326)::geography;
  ELSE
    NEW.geog := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS post_geog_trigger ON "Post";
CREATE TRIGGER post_geog_trigger
BEFORE INSERT OR UPDATE OF lat, lng ON "Post"
FOR EACH ROW EXECUTE FUNCTION post_sync_geog();

-- -------- User.notif_geog (centro de notificaciones) --------
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS notif_geog geography(Point, 4326);
UPDATE "User" SET notif_geog = ST_SetSRID(ST_MakePoint("notifLng", "notifLat"), 4326)::geography
  WHERE "notifLat" IS NOT NULL AND "notifLng" IS NOT NULL AND notif_geog IS NULL;
CREATE INDEX IF NOT EXISTS user_notif_geog_idx ON "User" USING GIST (notif_geog);

CREATE OR REPLACE FUNCTION user_sync_notif_geog() RETURNS trigger AS $$
BEGIN
  IF NEW."notifLat" IS NOT NULL AND NEW."notifLng" IS NOT NULL THEN
    NEW.notif_geog := ST_SetSRID(ST_MakePoint(NEW."notifLng", NEW."notifLat"), 4326)::geography;
  ELSE
    NEW.notif_geog := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_notif_geog_trigger ON "User";
CREATE TRIGGER user_notif_geog_trigger
BEFORE INSERT OR UPDATE OF "notifLat", "notifLng" ON "User"
FOR EACH ROW EXECUTE FUNCTION user_sync_notif_geog();

-- -------- Helper: users dentro del radio de un post --------
-- Retorna ids de usuarios cuyo notif_geog está dentro de notifRadiusKm del post,
-- excluyendo al autor.
CREATE OR REPLACE FUNCTION users_in_radius_of_post(post_id TEXT)
RETURNS TABLE(user_id TEXT) AS $$
  SELECT u.id
  FROM "User" u, "Post" p
  WHERE p.id = post_id
    AND p.geog IS NOT NULL
    AND u.notif_geog IS NOT NULL
    AND u.id <> p."authorId"
    AND ST_DWithin(u.notif_geog, p.geog, u."notifRadiusKm" * 1000);
$$ LANGUAGE SQL STABLE;
