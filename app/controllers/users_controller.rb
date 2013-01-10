class UsersController < ApplicationController

  respond_to :json

  before_filter :find_user, :only => [ :show, :update, :backup, :resend_verification, :verify ]
  before_filter :verify_api_key, :only => [ :show, :update, :backup ]

  def show
    respond_with_json(@user)
  end

  def create
    user = User.find_or_initialize_by_email(params[:email])
    user.save if user.new_record?
    user.encrypted_data = nil if user.encrypted_data?
    respond_with(user)
  end

  def update
    @user.update!(params[:api_key], params[:new_api_key], params[:encrypted_data], params[:schema_version], params[:email])
    respond_with_json(@user)
  end

  def backup
    filename, data = @user.backup_data
    if params[:type] == 'file'
      send_data(data, :filename => filename, :disposition => 'attachment', :type => :text)
    else
      Mailer.backup(@user.email, filename, data).deliver
      render :json => { :success => true }
    end
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
