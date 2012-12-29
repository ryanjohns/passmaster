class UsersController < ApplicationController

  respond_to :json

  def create
    user = User.find_or_create_by_email(params[:email])
    respond_with(user)
  end

  def configure
  end

  def update
  end

  def verify
  end

  def destroy
  end

end
