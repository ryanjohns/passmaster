class OtpSessionsController < ApplicationController

  def create
    otp_session = OtpSession.find_or_initialize_by(:user_id => params[:user_id], :client_id => cookies.encrypted[:_client_id])
    otp_session.assign_attributes({ :ip_address => request.remote_ip, :user_agent => request.user_agent, :last_seen_at => Time.zone.now })
    otp_session.verify_otp(params[:api_key], params[:otp])
    if otp_session.save && otp_session.active?
      render :json => { :success => true }
    else
      status = otp_session.locked? ? :locked : :precondition_failed
      render :json => { :success => false }, :status => status
    end
  end

end
