class UsersController < ApplicationController

  respond_to :json

  before_filter :find_user, :only => [ :show, :update, :backup, :resend_verification, :verify ]

  def show
    respond_with(@user)
  end

  def create
    user = User.find_or_initialize_by_email(params[:email])
    Mailer.verify_email(user).deliver if user.new_record? && user.save
    respond_with(user)
  end

  def update
    @user.update!(params[:api_key], params[:new_api_key], params[:encrypted_data], params[:schema_version])
    respond_with_json(@user)
  end

  def backup
    send_data(@user.encrypted_data || '', :filename => "passmaster-backup_#{Time.now.to_s(:yyyy_mm_dd)}.txt", :disposition => 'attachment', :type => :text)
  end

  def resend_verification
    Mailer.verify_email(@user).deliver if @user.generate_verification_code!
    respond_with(@user)
  end

  def verify
    @user.verify_code!(params[:verification_code])
    respond_with_json(@user)
  end

  private

  def find_user
    @user = User.find(params[:id])
  end

end
