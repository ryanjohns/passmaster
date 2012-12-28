class ApplicationController < ActionController::Base
  protect_from_forgery

  def index
  end

  def healthz
    render :text => 'ok'
  end

  protected

  def handle_unverified_request
    raise ActionController::InvalidAuthenticityToken
  end

end
