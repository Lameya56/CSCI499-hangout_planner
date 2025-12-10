CREATE DATABASE hangout_planner;
-- \c hangout_planner;

CREATE TABLE IF NOT EXISTS users(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Plans/Events table
CREATE TABLE IF NOT EXISTS plans(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    host_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    time TIME NOT NULL,
    image_url TEXT,
    deadline TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    confirmed_date DATE,
    confirmed_activity_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Proposed dates for a plan
CREATE TABLE IF NOT EXISTS plan_dates(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    plan_id BIGINT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    is_confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(plan_id, date)
);

-- Activities for a plan
CREATE TABLE IF NOT EXISTS activities(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    plan_id BIGINT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    name VARCHAR(500) NOT NULL,
    location VARCHAR(500),
    suggested_by BIGINT REFERENCES users(id),
    is_confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invitations ( invitee_id can be NULL initially)
CREATE TABLE IF NOT EXISTS invitations(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    plan_id BIGINT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    invitee_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    invite_token VARCHAR(255) UNIQUE NOT NULL,
    responded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(plan_id, email)
);

-- Date votes
CREATE TABLE IF NOT EXISTS date_votes(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    plan_date_id BIGINT NOT NULL REFERENCES plan_dates(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id BIGINT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(plan_date_id, user_id)
);

-- Activity votes
CREATE TABLE IF NOT EXISTS activity_votes(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    activity_id BIGINT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id BIGINT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(activity_id, user_id)
);


CREATE TABLE IF NOT EXISTS chat(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    plan_id BIGINT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    time_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS group_messages(
    id BIGSERIAL PIMARY KEY NOT NULL,
    

);


-- Create stories/posts table
CREATE TABLE IF NOT EXISTS explore_posts(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id BIGINT REFERENCES plans(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    location VARCHAR(255),
    tags TEXT[], -- Array of tags like ['beach', 'friends', 'summer']
    is_public BOOLEAN DEFAULT true,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create likes table 
CREATE TABLE IF NOT EXISTS post_likes(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    post_id BIGINT NOT NULL REFERENCES explore_posts(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(post_id, user_id)
);

-- Add comments table
CREATE TABLE IF NOT EXISTS post_comments(
    id BIGSERIAL PRIMARY KEY NOT NULL,
    post_id BIGINT NOT NULL REFERENCES explore_posts(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_post_comments_post ON post_comments(post_id);
CREATE INDEX idx_post_comments_user ON post_comments(user_id);
CREATE INDEX idx_post_comments_created ON post_comments(created_at DESC);

-- Trigger for comments updated_at
CREATE TRIGGER update_post_comments_updated_at 
BEFORE UPDATE ON post_comments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Indexes
CREATE INDEX idx_explore_posts_user ON explore_posts(user_id);
CREATE INDEX idx_explore_posts_public ON explore_posts(is_public);
CREATE INDEX idx_explore_posts_created ON explore_posts(created_at DESC);
CREATE INDEX idx_post_likes_post ON post_likes(post_id);

-- Trigger for updated_at
CREATE TRIGGER update_explore_posts_updated_at 
BEFORE UPDATE ON explore_posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- add the tables upto here the below ones are still being decided/ u can test or add them and update us. 

-- -- Change suggestions
-- CREATE TABLE IF NOT EXISTS change_suggestions(
--     id BIGSERIAL PRIMARY KEY NOT NULL,
--     plan_id BIGINT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
--     suggested_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     suggestion_type VARCHAR(50) NOT NULL,
--     suggested_date DATE,
--     suggested_activity VARCHAR(500),
--     suggested_activity_location VARCHAR(500),
--     suggested_time TIME,
--     reason TEXT,
--     status VARCHAR(50) DEFAULT 'pending',
--     responded_by BIGINT REFERENCES users(id),
--     responded_at TIMESTAMP,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Groups
-- CREATE TABLE IF NOT EXISTS groups(
--     id BIGSERIAL PRIMARY KEY NOT NULL,
--     plan_id BIGINT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
--     name VARCHAR(500),
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     UNIQUE(plan_id)
-- );

-- -- Group members
-- CREATE TABLE IF NOT EXISTS group_members(
--     id BIGSERIAL PRIMARY KEY NOT NULL,
--     group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
--     user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     UNIQUE(group_id, user_id)
-- );

-- -- Group messages
-- CREATE TABLE IF NOT EXISTS group_messages(
--     id BIGSERIAL PRIMARY KEY NOT NULL,
--     group_id BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
--     sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     message TEXT NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Memories
-- CREATE TABLE IF NOT EXISTS memories(
--     id BIGSERIAL PRIMARY KEY NOT NULL,
--     plan_id BIGINT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
--     created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     UNIQUE(plan_id)
-- );

-- -- Memory photos
-- CREATE TABLE IF NOT EXISTS memory_photos(
--     id BIGSERIAL PRIMARY KEY NOT NULL,
--     memory_id BIGINT NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
--     uploaded_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     photo_url TEXT NOT NULL,
--     caption TEXT,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Memory notes
-- CREATE TABLE IF NOT EXISTS memory_notes(
--     id BIGSERIAL PRIMARY KEY NOT NULL,
--     memory_id BIGINT NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
--     created_by BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
--     note TEXT NOT NULL,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Indexes
-- CREATE INDEX idx_plans_host ON plans(host_id);
-- CREATE INDEX idx_plans_status ON plans(status);
-- CREATE INDEX idx_plan_dates_plan ON plan_dates(plan_id);
-- CREATE INDEX idx_activities_plan ON activities(plan_id);
-- CREATE INDEX idx_invitations_plan ON invitations(plan_id);
-- CREATE INDEX idx_invitations_invitee ON invitations(invitee_id);
-- CREATE INDEX idx_invitations_token ON invitations(invite_token);
-- CREATE INDEX idx_invitations_email ON invitations(email);
-- CREATE INDEX idx_date_votes_plan ON date_votes(plan_id);
-- CREATE INDEX idx_activity_votes_plan ON activity_votes(plan_id);
-- CREATE INDEX idx_groups_plan ON groups(plan_id);
-- CREATE INDEX idx_group_members_group ON group_members(group_id);
-- CREATE INDEX idx_group_messages_group ON group_messages(group_id);
-- CREATE INDEX idx_memories_plan ON memories(plan_id);

-- -- Triggers
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.updated_at = CURRENT_TIMESTAMP;
--     RETURN NEW;
-- END;
-- $$ language 'plpgsql';

-- CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
--     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- CREATE TRIGGER update_memory_notes_updated_at BEFORE UPDATE ON memory_notes
--     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();