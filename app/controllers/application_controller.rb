class ApplicationController < ActionController::Base

  skip_before_action :verify_authenticity_token, :only => [:offline_sw]

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

  def offline_sw
    @paths_to_cache = Rails.cache.fetch('service_worker.paths_to_cache') do
      ['/'] + CACHED_ASSETS.map { |asset| ActionController::Base.helpers.asset_path(asset) }
    end
    @cache_name = Rails.cache.fetch('service_worker.cache_name') do
      cache_version = Rails.env.development? ? (Time.now.to_i - Time.now.to_i % 10) : CACHE_VERSION
      Digest::SHA2.hexdigest("#{cache_version}.#{@paths_to_cache.join('.')}")
    end
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
