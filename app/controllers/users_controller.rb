class UsersController < ApplicationController

  before_action :find_user, :only => [ :show, :update, :backup, :resend_verification, :verify ]
  before_action :verify_user, :only => [ :update ]
  before_action :verify_api_key, :only => [ :show, :update, :backup ]
  before_action :verify_otp_session, :only => [ :show, :update, :backup ]
  before_action :verify_version_code, :only => [ :update ]

  def show
    respond_with_json(@user)
  end

  def create
    user = User.with_email(params[:email]).first || User.new(:email => params[:email])
    user.save if user.new_record?
    user.encrypted_data = nil
    user.otp_secret = nil
    respond_with_json(user)
  end

  def update
    @user.update!(params)
    respond_with_json(@user)
  end

  def backup
    filename, data = User.backup_data(@user.schema_version, @user.encrypted_data)
    if params[:type] == 'file'
      zip = Zip::OutputStream.write_buffer do |archive|
        archive.put_next_entry(ACCOUNTS_VIEWER_FILENAME)
        archive.write(ACCOUNTS_VIEWER)
        archive.put_next_entry(filename)
        archive.write(data)
      end
      send_data(zip.string, :filename => "#{BACKUP_PREFIX}.zip", :disposition => 'attachment')
    else
      Mailer.backup(@user.email, filename, data).deliver_now
      render :json => { :success => true }
    end
  end

  def resend_verification
    Mailer.verify_email(@user).deliver_now if @user.generate_verification_code!
    @user.encrypted_data = nil
    @user.otp_secret = nil
    respond_with_json(@user)
  end

  def verify
    @user.verify_code!(params[:verification_code])
    unless @user.api_key_matches?(params[:api_key]) && @user.valid_otp_session?(cookies.encrypted[:_client_id], params[:otp_enabled], request.remote_ip, request.user_agent)
      @user.encrypted_data = nil
      @user.otp_secret = nil
    end
    respond_with_json(@user)
  end

  private

  def find_user
    @user = User.find(params[:id])
  end

  def verify_user
    unless @user.verified_at?
      render :json => { :errors => { :email => ['is not verified'] } }, :status => :unprocessable_entity
    end
  end

  def verify_api_key
    unless @user.api_key_matches?(params[:api_key])
      render :json => { :errors => { :api_key => ['is not authorized'] } }, :status => :unauthorized
    end
  end

  def verify_otp_session
    unless @user.valid_otp_session?(cookies.encrypted[:_client_id], params[:otp_enabled], request.remote_ip, request.user_agent)
      render :json => { :errors => { :otp_session => ['has not been established'] } }, :status => :precondition_failed
    end
  end

  def verify_version_code
    unless @user.version_code == params[:version_code]
      render :json => { :errors => { :version_code => ['does not match expected value'] } }, :status => :unprocessable_entity
    end
  end

end
