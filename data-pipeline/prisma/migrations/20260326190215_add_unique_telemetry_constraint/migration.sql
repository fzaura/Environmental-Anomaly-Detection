/*
  Warnings:

  - A unique constraint covering the columns `[station_id,recorded_at]` on the table `Telemetry` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Telemetry_station_id_recorded_at_key" ON "Telemetry"("station_id", "recorded_at");
