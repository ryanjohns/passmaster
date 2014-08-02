class HealthChecksController < ActionController::Base

  def show
    if db_connected?
      render :text => 'ok', :status => :ok
    else
      render :text => 'error', :status => :error
    end
  end

  private

  def db_connected?
    ActiveRecord::Base.connection.active?
  rescue
    false
  end

end
