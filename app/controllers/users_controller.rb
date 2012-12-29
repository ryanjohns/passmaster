class UsersController < ApplicationController

  respond_to :json

  before_filter :find_user, :only => [ :configure, :update, :verify, :destroy ]

  def create
    @user = User.find_or_create_by_email(params[:email])
    respond_with(@user)
  end

  def configure
  end

  def update
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
