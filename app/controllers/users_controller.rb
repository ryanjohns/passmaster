class UsersController < ApplicationController

  respond_to :json

  before_filter :find_user, :only => [ :show, :update, :backup, :resend_verification, :verify ]
  before_filter :verify_api_key, :only => [ :show, :update, :backup ]

  def show
    respond_with_json(@user)
  end

  def create
    user = User.find_or_initialize_by_email(params[:email])
    Mailer.verify_email(user).deliver if user.new_record? && user.save
    user.encrypted_data = nil if user.encrypted_data?
    respond_with(user)
  end

  def update
    email = @user.email
    updated = @user.update!(params[:api_key], params[:new_api_key], params[:encrypted_data], params[:schema_version], params[:email])
    if updated && email != @user.email
      Mailer.email_changed(email).deliver
      Mailer.verify_email(@user).deliver
    end
    respond_with_json(@user)
  end

  def backup
    data = {
      :schema_version => @user.schema_version,
      :encrypted_data => @user.encrypted_data,
    }.to_json
    send_data(data, :filename => "passmaster-backup_#{Time.now.to_s(:yyyy_mm_dd)}.txt", :disposition => 'attachment', :type => :text)
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

  def verify_api_key
    unless @user.authorized?(params[:api_key])
      render :json => { :errors => { :api_key => ['is not authorized'] } }, :status => :unprocessable_entity
    end
  end

end
