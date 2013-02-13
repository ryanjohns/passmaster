class VerificationsController < ApplicationController

  def verify
    user = User.find_by_verification_code(params[:id])
    if user.present? && user.verify_code!(params[:id])
      redirect_to root_path(:email => user.email)
    else
      redirect_to root_path
    end
  end

end
