require 'callsite'

module MetaRequest
  module ConsoleMessenger

    def debug(message = nil, &block)
      push_event(:debug, message)
      super
    end

    def info(message = nil, &block)
      push_event(:info, message)
      super
    end

    def warn(message = nil, &block)
      push_event(:warn, message)
      super
    end

    def error(message = nil, &block)
      push_event(:error, message)
      super
    end

    def fatal(message = nil, &block)
      push_event(:fatal, message)
      super
    end

    def unknown(message = nil, &block)
      push_event(:unknown, message)
      super
    end


    private
    def push_event(level, message)
      if dev_log = AppRequest.current
        c = Callsite.parse(caller[1])
        payload = {:message => message, :level => level, :line => c.line, :filename => c.filename, :method => c.method}
        evt = Event.new('console_logger.message', 0, 0, 0, payload)
        AppRequest.current.events << evt # FIXME unless AppRequest.current.events.include? evt
      end
    rescue Exception => e
      MetaRequest.logger.fatal(e.message + "\n " + e.backtrace.join("\n "))
    end
  end
end
