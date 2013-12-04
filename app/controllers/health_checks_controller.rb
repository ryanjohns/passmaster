class HealthChecksController < ActionController::Base

  def show
    ActiveRecord::Migrator.current_version
    render :text => 'ok', :status => :ok
  rescue
    render :text => 'error', :status => :error
  end

end
