class HealthChecksController < ActionController::Base

  def show
    if db_connected?
      render :text => 'ok', :status => :ok, :content_type => 'text/plain'
    else
      render :text => 'error', :status => :error, :content_type => 'text/plain'
    end
  end

  private

  def db_connected?
    ActiveRecord::Base.connection.active?
  rescue
    false
  end

end
