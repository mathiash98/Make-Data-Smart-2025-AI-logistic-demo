-- Supabase DATABASE Schema for a property management system

-- Enable Row Level Security
ALTER DATABASE postgres SET row_security = on;

-- Create custom types
CREATE TYPE task_type AS ENUM ('cleaning', 'maintenance', 'inspection', 'other');
CREATE TYPE task_status AS ENUM ('pending', 'confirmed', 'in_progress', 'cancelled', 'completed');
CREATE TYPE chat_sender AS ENUM ('system', 'user', 'agent', 'partner');
CREATE TYPE chat_source AS ENUM ('app', 'email', 'sms', 'other');

-- Properties table
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    address TEXT NOT NULL,
    wifi_ssid TEXT,
    wifi_password TEXT,
    access_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAQ table
CREATE TABLE faq (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partner table
CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    type task_type NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    check_in_date_time TIMESTAMPTZ NOT NULL,
    check_out_date_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_booking_dates CHECK (check_out_date_time > check_in_date_time)
);

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    task_description TEXT NOT NULL,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    can_start_after TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    type task_type NOT NULL,
    status task_status NOT NULL DEFAULT 'pending',
    partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_task_dates CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

-- Chat table
CREATE TABLE chat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    sender chat_sender NOT NULL,
    source chat_source NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chat_reference_check CHECK (
        (task_id IS NOT NULL AND booking_id IS NULL) OR 
        (task_id IS NULL AND booking_id IS NOT NULL)
    )
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_faq_updated_at BEFORE UPDATE ON faq FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_updated_at BEFORE UPDATE ON chat FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security on all tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat ENABLE ROW LEVEL SECURITY;

-- RLS Policies allowing anonymous users full access
CREATE POLICY "Allow anonymous access" ON properties FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anonymous access" ON faq FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anonymous access" ON partners FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anonymous access" ON bookings FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anonymous access" ON tasks FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anonymous access" ON chat FOR ALL TO anon USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_faq_property_id ON faq(property_id);
CREATE INDEX idx_bookings_property_id ON bookings(property_id);
CREATE INDEX idx_bookings_dates ON bookings(check_in_date_time, check_out_date_time);
CREATE INDEX idx_tasks_property_id ON tasks(property_id);
CREATE INDEX idx_tasks_booking_id ON tasks(booking_id);
CREATE INDEX idx_tasks_partner_id ON tasks(partner_id);
CREATE INDEX idx_tasks_type ON tasks(type);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_dates ON tasks(start_date, end_date, due_date);
CREATE INDEX idx_partners_type ON partners(type);
CREATE INDEX idx_partners_email ON partners(email);
CREATE INDEX idx_chat_task_id ON chat(task_id);
CREATE INDEX idx_chat_booking_id ON chat(booking_id);
CREATE INDEX idx_chat_created_at ON chat(created_at);