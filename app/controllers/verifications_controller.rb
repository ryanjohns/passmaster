class VerificationsController < ApplicationController

  def verify
    user = User.where(:verification_code => params[:id]).first
    if user.present? && user.verify_code!(params[:id])
      redirect_to root_path(:email => user.email)
    else
      redirect_to root_path
    end
  end

end
