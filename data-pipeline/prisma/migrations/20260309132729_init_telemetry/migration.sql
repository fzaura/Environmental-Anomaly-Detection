-- CreateTable
CREATE TABLE "Telemetry" (
    "id" SERIAL NOT NULL,
    "station_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recorded_at" TIMESTAMP(3) NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "temperature" DOUBLE PRECISION,
    "humidity" DOUBLE PRECISION,
    "PM2_5" DOUBLE PRECISION,
    "PM10" DOUBLE PRECISION,
    "CO" DOUBLE PRECISION,
    "SO2" DOUBLE PRECISION,
    "NO2" DOUBLE PRECISION,
    "O3" DOUBLE PRECISION,
    "hour_of_the_day" INTEGER NOT NULL,
    "day_of_the_week" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "anomalyScore" DOUBLE PRECISION,
    "is_anomaly" BOOLEAN,

    CONSTRAINT "Telemetry_pkey" PRIMARY KEY ("id")
);
