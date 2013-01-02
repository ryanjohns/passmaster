class UsersController < ApplicationController

  respond_to :json

  before_filter :find_user, :only => [ :show, :update, :resend_verification, :verify ]

  def show
    respond_with(@user)
  end

  def create
    user = User.find_or_initialize_by_email(params[:email])
    Mailer.verify_email(user).deliver if user.new_record? && user.save
    respond_with(user)
  end

  def update
    @user.update!(params[:api_key], params[:encrypted_data], params[:new_api_key])
    respond_with_json(@user)
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
