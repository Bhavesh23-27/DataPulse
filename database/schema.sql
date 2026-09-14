-- DataPulse Database Schema

CREATE TABLE organizations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_organization
        FOREIGN KEY (organization_id)
        REFERENCES organizations(id)
);

CREATE TABLE datasets (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_id BIGINT NOT NULL,
    created_by BIGINT,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    source_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_dataset_organization
        FOREIGN KEY (organization_id)
        REFERENCES organizations(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_dataset_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_dataset_source_type
        CHECK (source_type IN ('csv', 'json', 'api')),

    CONSTRAINT chk_dataset_status
        CHECK (status IN ('pending', 'processing', 'ready', 'failed'))
);

CREATE TABLE dataset_columns (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    dataset_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    data_type VARCHAR(20) NOT NULL,
    position INTEGER NOT NULL,
    nullable BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_dataset_columns_dataset
        FOREIGN KEY (dataset_id)
        REFERENCES datasets(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_dataset_columns_data_type
        CHECK (data_type IN ('text', 'number', 'boolean', 'date', 'datetime')),

    CONSTRAINT chk_dataset_columns_position
        CHECK (position > 0),

    CONSTRAINT uq_dataset_columns_name
        UNIQUE (dataset_id, name)
);

CREATE TABLE dataset_records (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    dataset_id BIGINT NOT NULL,
    data JSONB NOT NULL,
    row_number INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_dataset_records_dataset
        FOREIGN KEY (dataset_id)
        REFERENCES datasets(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_dataset_records_row_number
        CHECK (row_number > 0),

    CONSTRAINT uq_dataset_records_row
        UNIQUE (dataset_id, row_number)
);

