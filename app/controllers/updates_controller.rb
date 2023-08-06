class UpdatesController < ApplicationController

  layout 'updates'

  around_action :switch_language

  def show
  end

  private

  def switch_language(&action)
    I18n.with_locale(http_language, &action)
  end

end
