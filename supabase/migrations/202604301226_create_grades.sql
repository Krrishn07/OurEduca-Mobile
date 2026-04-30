-- ============================================================
-- 7. ASSIGNMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS assignments (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id   UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    class_id    UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    description TEXT,
    max_marks   INTEGER DEFAULT 100,
    due_date    TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 8. GRADES TABLE (Specific evaluations per assignment)
-- ============================================================
CREATE TABLE IF NOT EXISTS grades (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assignment_id   UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    marks           NUMERIC NOT NULL,
    feedback        TEXT,
    graded_at       TIMESTAMPTZ DEFAULT now(),
    UNIQUE(student_id, assignment_id)
);
