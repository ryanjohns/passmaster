class ApplicationController < ActionController::Base
  protect_from_forgery

  def index
  end

  def init_session
    if cookies.encrypted[:_client_id].blank?
      cookies.permanent.encrypted[:_client_id] = {
        :value    => SecureRandom.hex(16),
        :httponly => true,
        :secure   => Rails.configuration.force_ssl,
      }
    end
    render :json => { :token => form_authenticity_token }
  end

  def cache_manifest
    data = CACHE_MANIFEST
    data += "\n# #{Digest::SHA2.hexdigest((Time.now.to_i - Time.now.to_i % 10).to_s)}" if Rails.env.development?
    render :body => data, :content_type => 'text/cache-manifest'
  end

  protected

  def handle_unverified_request
    render :json => { :errors => { :token => ['is invalid', 'try reloading'] } }, :status => :unprocessable_entity
  end

  private

  def respond_with_json(object)
    if object.errors.present?
      render :json => { :errors => object.errors }, :status => :unprocessable_entity
    else
      render :json => object
    end
  end

  def append_info_to_payload(payload)
    super
    payload[:ip] = request.remote_ip
  end

end
