-- Debt Recovery CRM Database Schema
-- PostgreSQL initialization script

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (agents and supervisors)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('supervisor', 'agent')),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaigns table
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    dial_mode VARCHAR(20) NOT NULL CHECK (dial_mode IN ('progressive', 'predictive')),
    caller_id VARCHAR(20) NOT NULL,
    target_occupancy DECIMAL(5,2) DEFAULT 80.00,
    abandon_cap DECIMAL(5,2) DEFAULT 3.00,
    sip_route VARCHAR(100),
    gsm_route VARCHAR(100),
    is_active BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Allocations table (debtor records)
CREATE TABLE allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    debtor_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    amount_due DECIMAL(12,2) NOT NULL,
    account_number VARCHAR(100),
    due_date DATE,
    last_payment_date DATE,
    last_payment_amount DECIMAL(12,2),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'closed')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Call attempts table
CREATE TABLE call_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    allocation_id UUID REFERENCES allocations(id),
    agent_id UUID REFERENCES users(id),
    campaign_id UUID REFERENCES campaigns(id),
    phone_number VARCHAR(20) NOT NULL,
    call_type VARCHAR(20) NOT NULL CHECK (call_type IN ('progressive', 'predictive')),
    status VARCHAR(20) DEFAULT 'initiated' CHECK (status IN ('initiated', 'ringing', 'answered', 'completed', 'failed', 'abandoned')),
    start_time TIMESTAMP,
    answer_time TIMESTAMP,
    end_time TIMESTAMP,
    duration_seconds INTEGER DEFAULT 0,
    recording_url VARCHAR(500),
    asterisk_call_id VARCHAR(100),
    consent_captured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dispositions table
CREATE TABLE dispositions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_attempt_id UUID REFERENCES call_attempts(id) ON DELETE CASCADE,
    disposition_type VARCHAR(20) NOT NULL CHECK (disposition_type IN ('PTP', 'RTP', 'NTP', 'CB', 'DNC', 'WRONG_NUMBER', 'NO_ANSWER', 'BUSY', 'VOICEMAIL', 'OTHER')),
    ptp_amount DECIMAL(12,2),
    ptp_date DATE,
    notes TEXT,
    callback_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Callbacks table
CREATE TABLE callbacks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    allocation_id UUID REFERENCES allocations(id),
    agent_id UUID REFERENCES users(id),
    callback_date TIMESTAMP NOT NULL,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DNC (Do Not Call) table
CREATE TABLE dnc_numbers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    reason VARCHAR(100),
    added_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agent status table
CREATE TABLE agent_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES users(id) UNIQUE,
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('offline', 'ready', 'wrap', 'break', 'on_call')),
    campaign_id UUID REFERENCES campaigns(id),
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SIP routes table
CREATE TABLE sip_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    host VARCHAR(255) NOT NULL,
    port INTEGER DEFAULT 5060,
    username VARCHAR(100),
    password VARCHAR(255),
    caller_id VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GSM routes table
CREATE TABLE gsm_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    gateway_host VARCHAR(255) NOT NULL,
    gateway_port INTEGER DEFAULT 5060,
    username VARCHAR(100),
    password VARCHAR(255),
    channel_count INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_allocations_campaign_id ON allocations(campaign_id);
CREATE INDEX idx_allocations_phone_number ON allocations(phone_number);
CREATE INDEX idx_allocations_status ON allocations(status);
CREATE INDEX idx_call_attempts_allocation_id ON call_attempts(allocation_id);
CREATE INDEX idx_call_attempts_agent_id ON call_attempts(agent_id);
CREATE INDEX idx_call_attempts_campaign_id ON call_attempts(campaign_id);
CREATE INDEX idx_call_attempts_status ON call_attempts(status);
CREATE INDEX idx_call_attempts_start_time ON call_attempts(start_time);
CREATE INDEX idx_dispositions_call_attempt_id ON dispositions(call_attempt_id);
CREATE INDEX idx_dispositions_disposition_type ON dispositions(disposition_type);
CREATE INDEX idx_callbacks_allocation_id ON callbacks(allocation_id);
CREATE INDEX idx_callbacks_agent_id ON callbacks(agent_id);
CREATE INDEX idx_callbacks_callback_date ON callbacks(callback_date);
CREATE INDEX idx_dnc_phone_number ON dnc_numbers(phone_number);
CREATE INDEX idx_agent_status_agent_id ON agent_status(agent_id);
CREATE INDEX idx_agent_status_status ON agent_status(status);

-- Insert default admin user
INSERT INTO users (username, email, password_hash, role, first_name, last_name) 
VALUES ('admin', 'admin@debtrecovery.com', '$2b$10$rQZ8K9LmN2pQ3rS4tU5vW.abcdefghijklmnopqrstuvwxyz', 'admin', 'Admin', 'User');

-- Insert sample SIP route
INSERT INTO sip_routes (name, provider, host, port, username, password, caller_id) 
VALUES ('Airtel Business', 'Airtel', 'sip.airtel.in', 5060, 'your_username', 'your_password', '1401234567');

-- Insert sample GSM route
INSERT INTO gsm_routes (name, gateway_host, gateway_port, username, password, channel_count) 
VALUES ('GoIP Gateway', '192.168.1.100', 5060, 'goip', 'goip123', 4);
