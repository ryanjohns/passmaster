class ApplicationController < ActionController::Base
  protect_from_forgery

  def index
  end

  def init_session
    if cookies.signed[:_client_id].blank?
      cookies.permanent.signed[:_client_id] = {
        :value    => UUIDTools::UUID.random_create.hexdigest,
        :httponly => true,
      }
    end
    render :json => { :token => form_authenticity_token }
  end

  def healthz
    render :text => 'ok'
  end

  protected

  def handle_unverified_request
    render :json => { :errors => { :token => ['is invalid', 'try reloading'] } }, :status => :unprocessable_entity
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
