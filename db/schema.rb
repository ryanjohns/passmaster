# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2023_04_23_051148) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "otp_sessions", id: false, force: :cascade do |t|
    t.string "id", limit: 32, null: false
    t.string "user_id", limit: 32, null: false
    t.string "client_id", limit: 32, null: false
    t.integer "login_count", default: 0, null: false
    t.integer "failed_count", default: 0, null: false
    t.string "ip_address"
    t.text "user_agent"
    t.datetime "activated_at", precision: nil
    t.datetime "last_seen_at", precision: nil
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.index ["activated_at"], name: "index_otp_sessions_on_activated_at"
    t.index ["client_id"], name: "index_otp_sessions_on_client_id"
    t.index ["id"], name: "index_otp_sessions_on_id", unique: true
    t.index ["user_id", "client_id"], name: "index_otp_sessions_on_user_id_and_client_id", unique: true
  end

  create_table "users", id: false, force: :cascade do |t|
    t.string "id", limit: 32, null: false
    t.string "verification_code", limit: 32, null: false
    t.string "email", null: false
    t.text "api_key"
    t.text "encrypted_data"
    t.datetime "verified_at", precision: nil
    t.datetime "created_at", precision: nil, null: false
    t.datetime "updated_at", precision: nil, null: false
    t.integer "schema_version", default: 0, null: false
    t.string "otp_secret", limit: 16
    t.integer "password_length", default: 20, null: false
    t.integer "idle_timeout", default: 5, null: false
    t.boolean "otp_enabled", default: false, null: false
    t.boolean "special_chars", default: true, null: false
    t.boolean "auto_backup", default: false, null: false
    t.string "version_code"
    t.boolean "touch_id_enabled", default: false
    t.string "language"
    t.index "lower((email)::text)", name: "index_users_on_lower_email", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["id"], name: "index_users_on_id", unique: true
    t.index ["verification_code"], name: "index_users_on_verification_code", unique: true
  end
end
