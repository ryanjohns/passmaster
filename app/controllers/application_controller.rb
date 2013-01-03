class ApplicationController < ActionController::Base
  protect_from_forgery

  def index
  end

  def healthz
    render :text => 'ok'
  end

  protected

  def form_authenticity_token
    session[:_csrf_token] ||= SecureRandom.base64(32)
    cookies[:_passmaster_token] = Base64::encode64(session[:_csrf_token])
    session[:_csrf_token]
  end

  def handle_unverified_request
    raise ActionController::InvalidAuthenticityToken
  end

  private

  def respond_with_json(object)
    respond_with(object) do |format|
      format.json do
        if object.errors.present?
          render :json => { :errors => object.errors }, :status => :unprocessable_entity
        else
          render :json => object
        end
      end
    end
  end

end
