class HealthChecksController < ActionController::Base

  def show
    if db_connected?
      render :plain => 'ok', :status => :ok
    else
      render :plain => 'error', :status => :internal_server_error
    end
  end

  private

  def db_connected?
    ActiveRecord::Base.connection.verify!
  rescue
    false
  end

end
