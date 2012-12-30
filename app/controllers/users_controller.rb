class UsersController < ApplicationController

  respond_to :json

  before_filter :find_user, :only => [ :show, :configure, :update, :verify, :destroy ]

  def show
    respond_with(@user)
  end

  def create
    @user = User.find_or_create_by_email(params[:email])
    respond_with(@user)
  end

  def configure
    @user.configure!(params[:api_key], params[:encrypted_data])
    respond_with(@user)
  end

  def update
    @user.update!(params[:api_key], params[:encrypted_data])
    respond_with(@user)
  end

  def verify
    @user.verify_code!(params[:verification_code])
    respond_with(@user)
  end

  def destroy
  end

  private

  def find_user
    @user = User.find(params[:id])
  end

end
