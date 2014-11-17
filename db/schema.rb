# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20130426083839) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "otp_sessions", id: false, force: true do |t|
    t.string   "id",           limit: 32,             null: false
    t.string   "user_id",      limit: 32,             null: false
    t.string   "client_id",    limit: 32,             null: false
    t.integer  "login_count",             default: 0, null: false
    t.integer  "failed_count",            default: 0, null: false
    t.string   "ip_address"
    t.text     "user_agent"
    t.datetime "activated_at"
    t.datetime "last_seen_at"
    t.datetime "created_at",                          null: false
    t.datetime "updated_at",                          null: false
  end

  add_index "otp_sessions", ["activated_at"], name: "index_otp_sessions_on_activated_at", using: :btree
  add_index "otp_sessions", ["client_id"], name: "index_otp_sessions_on_client_id", unique: true, using: :btree
  add_index "otp_sessions", ["id"], name: "index_otp_sessions_on_id", unique: true, using: :btree
  add_index "otp_sessions", ["user_id", "client_id"], name: "index_otp_sessions_on_user_id_and_client_id", using: :btree

  create_table "users", id: false, force: true do |t|
    t.string   "id",                limit: 32,                 null: false
    t.string   "verification_code", limit: 32,                 null: false
    t.string   "email",                                        null: false
    t.text     "api_key"
    t.text     "encrypted_data"
    t.datetime "verified_at"
    t.datetime "created_at",                                   null: false
    t.datetime "updated_at",                                   null: false
    t.integer  "schema_version",               default: 0,     null: false
    t.string   "otp_secret",        limit: 16
    t.integer  "password_length",              default: 20,    null: false
    t.integer  "idle_timeout",                 default: 5,     null: false
    t.boolean  "otp_enabled",                  default: false, null: false
    t.boolean  "special_chars",                default: true,  null: false
    t.boolean  "auto_backup",                  default: false, null: false
    t.string   "version_code"
  end

  add_index "users", ["email"], name: "index_users_on_email", unique: true, using: :btree
  add_index "users", ["id"], name: "index_users_on_id", unique: true, using: :btree
  add_index "users", ["verification_code"], name: "index_users_on_verification_code", unique: true, using: :btree

end
